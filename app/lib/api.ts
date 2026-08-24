import { randomBytes } from 'node:crypto';
import type { Collection, Filter, Sort } from 'mongodb';
import { can } from '../features/admin/lib/permissions.ts';
import { currentUser } from './session.ts';
import type { AdminPermission, UserProfile } from '../types.ts';

/**
 * Shared plumbing for the JSON API. The four content collections
 * (questions, courses, resources, mock tests) are the same CRUD with different
 * defaults and different things to hide, so they share `crud()` below instead of
 * four copies of the same twelve lines.
 */

export const bad = (message: string, status = 400) => Response.json({ error: message }, { status });

/** Same id shape as the auth route: sortable prefix, random tail. */
export const newId = (prefix: string) => `${prefix}-${Date.now()}-${randomBytes(3).toString('hex')}`;

export const today = () => new Date().toISOString().split('T')[0];

/** Callers do `if (denied(user)) return user;` — the guard doubles as the response. */
export const denied = (value: unknown): value is Response => value instanceof Response;

export async function requireUser(): Promise<UserProfile | Response> {
  return (await currentUser()) ?? bad('Sign in first', 401);
}

export async function requirePermission(
  permission: keyof AdminPermission,
): Promise<UserProfile | Response> {
  const user = await currentUser();
  if (!user) return bad('Sign in first', 401);
  if (!can(user, permission)) return bad('You do not have permission to do that', 403);
  return user;
}

/** Duplicate _id or a unique index (question code, course slug) — a 409, not a 500. */
export function writeError(err: unknown): Response {
  if ((err as { code?: number })?.code === 11000) {
    return bad('That id, code or slug is already taken', 409);
  }
  throw err;
}

export const readBody = async (request: Request) => request.json().catch(() => null);

type Handler = (request: Request, ctx: { params: Promise<{ id?: string[] }> }) => Promise<Response>;

interface CrudOptions<T extends { id: string }, D extends { _id: string }> {
  collection: () => Promise<Collection<D>>;
  /** Permission required to write. Reading is open; `visibleTo` decides what is returned. */
  permission: keyof AdminPermission;
  idPrefix: string;
  toApp: (doc: D) => T;
  toDoc: (row: T) => D;
  /**
   * Fill defaults and recompute derived fields. Runs on create *and* on update
   * (over the merged row), so things like lessonsCount can never go stale.
   */
  normalize: (row: Partial<T>, id: string) => T;
  /** What a viewer without `permission` may see. Identity when omitted. */
  visibleTo?: (row: T, user: UserProfile | null) => T;
  query?: (params: URLSearchParams, user: UserProfile | null) => Filter<D>;
  sort?: Sort;
}

/** The driver types _id as an ObjectId unless told otherwise; every id here is a string. */
type StringIdDoc = { _id: string };

export function crud<T extends { id: string }, D extends { _id: string }>(
  o: CrudOptions<T, D>,
): { GET: Handler; POST: Handler; PATCH: Handler; DELETE: Handler } {
  // One cast here keeps the driver's generics out of every call site.
  const open = async () => (await o.collection()) as unknown as Collection<StringIdDoc>;
  const idOf = async (ctx: { params: Promise<{ id?: string[] }> }) => (await ctx.params).id?.[0];

  const GET: Handler = async (request, ctx) => {
    const user = await currentUser();
    const col = await open();
    const id = await idOf(ctx);
    // Managers see the raw record: the admin console edits what redaction hides.
    const view = (row: T) => (can(user, o.permission) ? row : (o.visibleTo?.(row, user) ?? row));

    if (id) {
      const doc = await col.findOne({ _id: id });
      if (!doc) return bad('Not found', 404);
      return Response.json({ item: view(o.toApp(doc as unknown as D)) });
    }

    const params = new URL(request.url).searchParams;
    const docs = await col
      .find((o.query?.(params, user) ?? {}) as Filter<StringIdDoc>)
      // ids carry their creation timestamp, so this is newest-first without an index.
      .sort(o.sort ?? { _id: -1 })
      .toArray();
    return Response.json({ items: docs.map((d) => view(o.toApp(d as unknown as D))) });
  };

  const POST: Handler = async (request) => {
    const user = await requirePermission(o.permission);
    if (denied(user)) return user;
    const body = await readBody(request);
    if (!body) return bad('Expected a JSON body');

    // An array is a bulk import; a single object is one new record.
    const incoming: Partial<T>[] = Array.isArray(body) ? body : [body];
    if (!incoming.length) return bad('Nothing to create');
    const rows = incoming.map((row) => o.normalize(row, row.id ?? newId(o.idPrefix)));

    const col = await open();
    try {
      await col.insertMany(rows.map((r) => o.toDoc(r) as unknown as StringIdDoc));
    } catch (err) {
      return writeError(err);
    }
    return Response.json(Array.isArray(body) ? { items: rows } : { item: rows[0] }, { status: 201 });
  };

  const PATCH: Handler = async (request, ctx) => {
    const user = await requirePermission(o.permission);
    if (denied(user)) return user;
    const id = await idOf(ctx);
    if (!id) return bad('Which record? PATCH /<collection>/<id>');
    const patch = await readBody(request);
    if (!patch) return bad('Expected a JSON body');

    const col = await open();
    const existing = await col.findOne({ _id: id });
    if (!existing) return bad('Not found', 404);

    // Read-modify-write rather than $set: normalize() needs the merged row to
    // recompute derived fields. Fine at this scale — swap to an aggregation
    // pipeline update if two admins ever edit one record at the same second.
    const row = o.normalize({ ...o.toApp(existing as unknown as D), ...patch, id }, id);
    try {
      await col.replaceOne({ _id: id }, o.toDoc(row) as unknown as StringIdDoc);
    } catch (err) {
      return writeError(err);
    }
    return Response.json({ item: row });
  };

  const DELETE: Handler = async (_request, ctx) => {
    const user = await requirePermission(o.permission);
    if (denied(user)) return user;
    const id = await idOf(ctx);
    if (!id) return bad('Which record? DELETE /<collection>/<id>');
    const { deletedCount } = await (await open()).deleteOne({ _id: id });
    if (!deletedCount) return bad('Not found', 404);
    return Response.json({ ok: true });
  };

  return { GET, POST, PATCH, DELETE };
}
