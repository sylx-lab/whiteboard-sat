import { can, NO_PERMISSIONS, DEFAULT_STAFF_PERMISSIONS } from '../../../features/admin/lib/permissions.ts';
import { bad, denied, newId, readBody, requireUser, today } from '../../../lib/api.ts';
import { hashPassword, signToken, RESET_PASSWORD_TTL } from '../../../lib/auth.ts';
import { sendStaffCredentialsEmail, sendPasswordResetEmail, appUrl } from '../../../lib/email.ts';
import { collections, hydrate } from '../../../lib/db.ts';
import type { UserDoc } from '../../../lib/db.ts';
import type { AccessGrants } from '../../../types.ts';

/**
 * The admin console's Students and Team lists, and the one editor behind both
 * (`/admin/people/[id]`). Which permission a change needs depends on the change:
 * passes and suspension are student management, role and permissions are team
 * management. The self-edit guards from the UI are repeated here, because a UI
 * guard is a hint and this is the rule.
 */
type Ctx = { params: Promise<{ id?: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  const user = await requireUser();
  if (denied(user)) return user;
  if (!can(user, 'canManageStudents') && !can(user, 'canManageSubAdmins')) {
    return bad('You do not have permission to do that', 403);
  }

  const users = await collections.users();
  const id = (await ctx.params).id?.[0];
  if (id) {
    const doc = await users.findOne({ _id: id });
    return doc ? Response.json({ item: hydrate.user(doc) }) : bad('Not found', 404);
  }

  const role = new URL(request.url).searchParams.get('role') as UserDoc['role'] | null;
  const docs = await users.find(role ? { role } : {}).sort({ createdAt: -1 }).toArray();
  return Response.json({ items: docs.map(hydrate.user) });
}

/**
 * POST /api/users — add a staff member.
 * Password is required and securely hashed.
 * An email containing account credentials and login link is sent to the staff member.
 */
export async function POST(request: Request) {
  const user = await requireUser();
  if (denied(user)) return user;
  if (!can(user, 'canManageSubAdmins')) return bad('You do not have permission to do that', 403);

  const body = await readBody(request);
  if (!body?.name?.trim()) return bad('A name is required');
  if (!body.email?.trim()) return bad('An email address is required');
  if (!body.password?.trim()) return bad('A password is required for the new staff member');
  if (body.password.trim().length < 8) return bad('Password must be at least 8 characters');

  const cleanEmail = body.email.trim().toLowerCase();
  const cleanPhone = body.phone?.trim() ? body.phone.trim() : undefined;
  const rawPassword = body.password.trim();
  const passwordHash = await hashPassword(rawPassword);

  const users = await collections.users();
  const emailClash = await users.findOne({ email: cleanEmail });

  if (emailClash) {
    if (emailClash.role === 'admin' || emailClash.role === 'sub_admin') {
      return bad('A staff member with this email already exists', 409);
    }
    // An existing student account is being granted staff status explicitly by an admin with canManageSubAdmins
    const set: Partial<UserDoc> = {
      name: body.name.trim(),
      role: 'sub_admin',
      ...(cleanPhone ? { phone: cleanPhone } : {}),
      passwordHash,
      permissions: { ...DEFAULT_STAFF_PERMISSIONS, ...(body.permissions ?? {}) },
      access: {
        premiumMath: true,
        premiumReadingWriting: true,
        redbookPractice: true,
        enrolledCourseIds: [],
        fullPremium: true,
      },
    };
    await users.updateOne({ _id: emailClash._id }, { $set: set });

    // Send credentials email
    await sendStaffCredentialsEmail(
      cleanEmail,
      body.name.trim(),
      cleanEmail,
      rawPassword,
      appUrl('/', request),
    ).catch((err) => console.warn('[email] Staff credentials email note:', err));

    return Response.json({ item: hydrate.user({ ...emailClash, ...set } as UserDoc) }, { status: 200 });
  }

  if (cleanPhone) {
    const phoneClash = await users.findOne({ phone: cleanPhone });
    if (phoneClash) return bad('An account with this phone number already exists', 409);
  }

  const doc: UserDoc = {
    _id: newId('user-staff'),
    name: body.name.trim(),
    email: cleanEmail,
    ...(cleanPhone ? { phone: cleanPhone } : {}),
    passwordHash,
    role: 'sub_admin',
    targetScore: 1600,
    createdAt: today(),
    access: {
      premiumMath: true,
      premiumReadingWriting: true,
      redbookPractice: true,
      enrolledCourseIds: [],
      fullPremium: true,
    },
    permissions: { ...DEFAULT_STAFF_PERMISSIONS, ...(body.permissions ?? {}) },
    courseProgress: {},
  };

  await users.insertOne(doc);

  // Send credentials email
  await sendStaffCredentialsEmail(
    cleanEmail,
    body.name.trim(),
    cleanEmail,
    rawPassword,
    appUrl('/', request),
  ).catch((err) => console.warn('[email] Staff credentials email note:', err));

  return Response.json({ item: hydrate.user(doc) }, { status: 201 });
}

/** PATCH /api/users/<id> — { role?, permissions?, access?, isSuspended?, password?, sendResetLink? }. Applies immediately. */
export async function PATCH(request: Request, ctx: Ctx) {
  const user = await requireUser();
  if (denied(user)) return user;
  const id = (await ctx.params).id?.[0];
  if (!id) return bad('Which person? PATCH /api/users/<id>');

  const body = await readBody(request);
  if (!body) return bad('Expected a JSON body');
  const wantsStaffChange = 'role' in body || 'permissions' in body || 'password' in body || 'sendResetLink' in body;
  const wantsStudentChange = 'access' in body || 'isSuspended' in body;

  if (wantsStaffChange && !can(user, 'canManageSubAdmins') && !can(user, 'canManageStudents')) {
    return bad('You do not have permission to manage user credentials or settings', 403);
  }
  if (wantsStudentChange && !can(user, 'canManageStudents')) {
    return bad('You do not have permission to change access', 403);
  }
  if (!wantsStaffChange && !wantsStudentChange) return bad('Nothing to change');
  // Nobody edits themselves out of — or further into — their own authority.
  if (id === user.id && (wantsStaffChange || 'isSuspended' in body) && !('password' in body)) {
    return bad('You cannot change your own role, permissions or suspension');
  }

  const users = await collections.users();
  const existing = await users.findOne({ _id: id });
  if (!existing) return bad('Not found', 404);

  if (body.sendResetLink) {
    if (!existing.email) return bad('This account does not have an email address on file', 400);
    const token = signToken(existing._id, 'reset_password', existing.passwordHash, RESET_PASSWORD_TTL);
    const resetUrl = appUrl(`/reset-password?token=${token}`, request);
    await sendPasswordResetEmail(existing.email, existing.name, resetUrl);
    return Response.json({ ok: true, message: `Password setup link sent to ${existing.email}` });
  }

  const set: Record<string, unknown> = {};
  if ('role' in body) {
    if (!['student', 'admin', 'sub_admin'].includes(body.role)) return bad('Unknown role');
    if (
      existing.role === 'student' &&
      (body.role === 'sub_admin' || body.role === 'admin')
    ) {
      return bad(
        'Promoting a student account to staff is not allowed here. Create/upgrade from Team > New staff member instead.',
        400
      );
    }
    set.role = body.role;
    if (body.role === 'sub_admin') set.permissions = existing.permissions ?? { ...NO_PERMISSIONS };
  }
  if ('permissions' in body) {
    set.permissions = { ...NO_PERMISSIONS, ...(existing.permissions ?? {}), ...body.permissions };
  }
  if ('password' in body && body.password?.trim()) {
    if (body.password.trim().length < 8) return bad('Password must be at least 8 characters');
    const rawPassword = body.password.trim();
    set.passwordHash = await hashPassword(rawPassword);

    if (existing.email && (body.sendCredentialsEmail ?? true)) {
      await sendStaffCredentialsEmail(
        existing.email,
        existing.name,
        existing.email,
        rawPassword,
        appUrl('/', request),
      ).catch((err) => console.warn('[email] Staff credentials email note:', err));
    }
  }
  if ('isSuspended' in body) set.isSuspended = !!body.isSuspended;
  if ('access' in body) set.access = normalizeAccess({ ...existing.access, ...body.access }, await allCourseIds());

  await users.updateOne({ _id: id }, { $set: set });
  return Response.json({ item: hydrate.user({ ...existing, ...set } as UserDoc) });
}

/** DELETE /api/users/<id> — delete a user account and their test attempts. */
export async function DELETE(request: Request, ctx: Ctx) {
  const user = await requireUser();
  if (denied(user)) return user;
  const id = (await ctx.params).id?.[0];
  if (!id) return bad('Which person? DELETE /api/users/<id>');

  if (id === user.id) {
    return bad('You cannot delete your own account', 400);
  }

  const users = await collections.users();
  const existing = await users.findOne({ _id: id });
  if (!existing) return bad('Not found', 404);

  const isStaff = existing.role === 'admin' || existing.role === 'sub_admin';
  if (isStaff && !can(user, 'canManageSubAdmins')) {
    return bad('You do not have permission to delete staff members', 403);
  }
  if (!isStaff && !can(user, 'canManageStudents')) {
    return bad('You do not have permission to delete student accounts', 403);
  }

  await users.deleteOne({ _id: id });
  const practiceAttempts = await collections.practiceAttempts();
  const mockAttempts = await collections.mockAttempts();
  await Promise.all([
    practiceAttempts.deleteMany({ userId: id }),
    mockAttempts.deleteMany({ userId: id }),
  ]);

  return Response.json({ ok: true, deletedId: id });
}

const allCourseIds = async () =>
  (await (await collections.courses()).find({}).project({ _id: 1 }).toArray()).map((c) =>
    String(c._id),
  );

/** A full pass implies the subject passes and every course, exactly as the editor shows it. */
function normalizeAccess(access: AccessGrants, courseIds: string[]): AccessGrants {
  if (!access.fullPremium) return access;
  return {
    premiumMath: true,
    premiumReadingWriting: true,
    redbookPractice: true,
    enrolledCourseIds: courseIds,
    fullPremium: true,
  };
}
