import { applyPlanGrants } from '../../../lib/access.ts';
import { bad, denied, newId, readBody, requirePermission, requireUser } from '../../../lib/api.ts';
import { collections, dehydrate, hydrate } from '../../../lib/db.ts';
import { INITIAL_PLANS } from '../../../data/seedData.ts';
import type { PaymentStatus, PaymentSubmission } from '../../../types.ts';

/**
 * Manual bKash/Nagad verification. The money path, so nothing about the payer
 * or the price is taken from the request body: the identity comes from the
 * session and the amount from the plan being bought.
 */
type Ctx = { params: Promise<{ id?: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  const user = await requireUser();
  if (denied(user)) return user;
  const payments = await collections.payments();
  const id = (await ctx.params).id?.[0];

  if (id) {
    const doc = await payments.findOne({ _id: id });
    if (!doc) return bad('Not found', 404);
    const item = hydrate.payment(doc);
    // A student may read their own receipt; the queue is staff-only.
    const staff = await requirePermission('canManagePurchases');
    if (item.userId !== user.id && denied(staff)) return staff;
    return Response.json({ item });
  }

  const staff = await requirePermission('canManagePurchases');
  const filter: Record<string, unknown> = denied(staff) ? { userId: user.id } : {};
  const status = new URL(request.url).searchParams.get('status');
  if (status) filter.status = status;

  const docs = await payments.find(filter).sort({ submittedAt: -1 }).toArray();
  return Response.json({ items: docs.map(hydrate.payment) });
}

/** POST /api/payments — a student submitting a transaction reference. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (denied(user)) return user;
  const body = await readBody(request);
  if (!body?.productId || !body.referenceNumber?.trim() || !body.senderPhoneNumber?.trim()) {
    return bad('productId, referenceNumber and senderPhoneNumber are required');
  }

  const plan = INITIAL_PLANS.find((p) => p.id === body.productId);
  const course = plan
    ? null
    : await (await collections.courses()).findOne({ _id: String(body.productId) });
  if (!plan && !course) return bad('No such plan or course', 404);

  const now = new Date().toISOString();
  const payment: PaymentSubmission = {
    id: newId('pay'),
    userId: user.id,
    userName: user.name,
    userPhone: user.phone ?? body.senderPhoneNumber,
    userEmail: user.email,
    productId: body.productId,
    productName: plan?.name ?? course!.title,
    productTitle: plan?.name ?? course!.title,
    // The catalog price, not the posted one.
    amount: plan?.price ?? course!.price,
    paymentMethod: body.paymentMethod ?? 'bKash',
    referenceNumber: String(body.referenceNumber).trim(),
    senderPhoneNumber: String(body.senderPhoneNumber).trim(),
    notes: body.notes,
    status: 'pending',
    submittedAt: now,
    createdAt: now,
  };
  await (await collections.payments()).insertOne(dehydrate.payment(payment));
  return Response.json({ item: payment }, { status: 201 });
}

/** PATCH /api/payments/<id> — { status: 'verified' | 'rejected' }. Verifying grants access. */
export async function PATCH(request: Request, ctx: Ctx) {
  const staff = await requirePermission('canManagePurchases');
  if (denied(staff)) return staff;
  const id = (await ctx.params).id?.[0];
  if (!id) return bad('Which payment? PATCH /api/payments/<id>');

  const body = await readBody(request);
  const status = body?.status as PaymentStatus | undefined;
  if (status !== 'verified' && status !== 'rejected') {
    return bad("status must be 'verified' or 'rejected'");
  }

  const payments = await collections.payments();
  const existing = await payments.findOne({ _id: id });
  if (!existing) return bad('Not found', 404);

  await payments.updateOne(
    { _id: id },
    { $set: { status, reviewedAt: new Date().toISOString(), reviewedBy: staff.name } },
  );

  // Only on the transition, so re-verifying an already verified payment is a
  // no-op rather than a second grant.
  if (status === 'verified' && existing.status !== 'verified') {
    await grantFor(existing.userId, existing.productId);
  }

  return Response.json({ item: { ...hydrate.payment(existing), status, reviewedBy: staff.name } });
}

/** Expand a purchase onto the buyer's access — a plan's grants, or one course. */
async function grantFor(userId: string, productId: string) {
  const users = await collections.users();
  const target = await users.findOne({ _id: userId });
  if (!target) return;

  const plan = INITIAL_PLANS.find((p) => p.id === productId);
  if (plan) {
    const ids = (await (await collections.courses()).find({}).project({ _id: 1 }).toArray()).map(
      (c) => String(c._id),
    );
    await users.updateOne({ _id: userId }, { $set: { access: applyPlanGrants(target.access, plan, ids) } });
    return;
  }

  // A single course purchase, which the localStorage store granted nothing for.
  await users.updateOne({ _id: userId }, { $addToSet: { 'access.enrolledCourseIds': productId } });
}
