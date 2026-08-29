import { collections, hydrate, dehydrate } from '../../../lib/db';
import { DEFAULT_PAYMENT_SETTINGS } from '../../../data/seedData';
import { currentUser } from '../../../lib/session';
import { can } from '../../../features/admin/lib/permissions';
import { PaymentSettings } from '../../../types';

export async function GET() {
  try {
    const col = await collections.paymentSettings();
    const doc = await col.findOne({ _id: 'payment_settings' });
    if (!doc) {
      return Response.json({ settings: DEFAULT_PAYMENT_SETTINGS });
    }
    return Response.json({ settings: hydrate.paymentSettings(doc) });
  } catch (err) {
    console.error('Error fetching payment settings:', err);
    return Response.json({ settings: DEFAULT_PAYMENT_SETTINGS });
  }
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user || (user.role !== 'admin' && !can(user, 'canManagePurchases'))) {
    return Response.json({ error: 'Unauthorized to update payment settings' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.settings) {
    return Response.json({ error: 'Invalid settings body' }, { status: 400 });
  }

  const newSettings: PaymentSettings = {
    ...DEFAULT_PAYMENT_SETTINGS,
    ...body.settings,
    id: 'payment_settings',
    updatedAt: new Date().toISOString(),
  };

  const col = await collections.paymentSettings();
  const doc = dehydrate.paymentSettings(newSettings);
  await col.updateOne({ _id: 'payment_settings' }, { $set: doc }, { upsert: true });

  return Response.json({ settings: newSettings });
}
