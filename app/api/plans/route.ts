import { collections, hydrate, dehydrate } from '../../lib/db';
import { INITIAL_PLANS } from '../../data/seedData';
import { currentUser } from '../../lib/session';
import { can } from '../../features/admin/lib/permissions';
import { ProductPlan } from '../../types';

export async function GET() {
  try {
    const col = await collections.plans();
    const count = await col.countDocuments();
    if (count === 0) {
      // Seed default plans on first access
      for (const p of INITIAL_PLANS) {
        await col.updateOne({ _id: p.id }, { $set: dehydrate.plan(p) }, { upsert: true });
      }
      return Response.json({ items: INITIAL_PLANS });
    }
    const docs = await col.find().toArray();
    return Response.json({ items: docs.map(hydrate.plan) });
  } catch (err) {
    console.error('Error fetching plans:', err);
    return Response.json({ items: INITIAL_PLANS });
  }
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user || (user.role !== 'admin' && !can(user, 'canManagePurchases'))) {
    return Response.json({ error: 'Unauthorized to update plans' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.plan || !body.plan.id) {
    return Response.json({ error: 'Invalid plan body' }, { status: 400 });
  }

  const plan: ProductPlan = body.plan;
  const col = await collections.plans();
  await col.updateOne({ _id: plan.id }, { $set: dehydrate.plan(plan) }, { upsert: true });

  const docs = await col.find().toArray();
  return Response.json({ items: docs.map(hydrate.plan) });
}
