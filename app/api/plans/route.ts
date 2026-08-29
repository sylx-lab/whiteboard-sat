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

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || (user.role !== 'admin' && !can(user, 'canManagePurchases'))) {
    return Response.json({ error: 'Unauthorized to create plans' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.plan || !body.plan.name) {
    return Response.json({ error: 'Invalid plan body' }, { status: 400 });
  }

  const planId = body.plan.id || `plan-${Date.now()}`;
  const plan: ProductPlan = {
    ...body.plan,
    id: planId,
    slug: body.plan.slug || planId,
    description: body.plan.description || '',
    price: Number(body.plan.price) || 0,
    originalPrice: Number(body.plan.originalPrice) || 0,
    period: body.plan.period || 'One-time access',
    grants: body.plan.grants || {},
    features: body.plan.features || [],
  };

  const col = await collections.plans();
  await col.updateOne({ _id: plan.id }, { $set: dehydrate.plan(plan) }, { upsert: true });

  const docs = await col.find().toArray();
  return Response.json({ items: docs.map(hydrate.plan), created: plan });
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

  const plan: ProductPlan = {
    ...body.plan,
    price: Number(body.plan.price) || 0,
    originalPrice: Number(body.plan.originalPrice) || 0,
    features: body.plan.features || [],
    grants: body.plan.grants || {},
  };

  const col = await collections.plans();
  await col.updateOne({ _id: plan.id }, { $set: dehydrate.plan(plan) }, { upsert: true });

  const docs = await col.find().toArray();
  return Response.json({ items: docs.map(hydrate.plan) });
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user || (user.role !== 'admin' && !can(user, 'canManagePurchases'))) {
    return Response.json({ error: 'Unauthorized to delete plans' }, { status: 403 });
  }

  const url = new URL(request.url);
  const idFromQuery = url.searchParams.get('id');
  const body = await request.json().catch(() => null);
  const planId = idFromQuery || body?.id;

  if (!planId) {
    return Response.json({ error: 'Plan id is required' }, { status: 400 });
  }

  const col = await collections.plans();
  await col.deleteOne({ _id: planId });

  const docs = await col.find().toArray();
  return Response.json({ items: docs.map(hydrate.plan) });
}
