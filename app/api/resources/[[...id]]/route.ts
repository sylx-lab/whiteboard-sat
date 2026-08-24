import { canSeeResource, redactResource } from '../../../lib/access.ts';
import { crud, today } from '../../../lib/api.ts';
import { collections, dehydrate, hydrate } from '../../../lib/db.ts';
import type { ResourceDoc } from '../../../lib/db.ts';
import type { ResourceItem } from '../../../types.ts';

const routes = crud<ResourceItem, ResourceDoc>({
  collection: collections.resources,
  permission: 'canManageResources',
  idPrefix: 'res',
  toApp: hydrate.resource,
  toDoc: dehydrate.resource,
  normalize: (row, id) => ({
    ...(row as ResourceItem),
    id,
    category: row.category ?? 'formula_sheet',
    subject: row.subject ?? 'general',
    is_free: row.is_free ?? true,
    dateAdded: row.dateAdded ?? today(),
  }),
  // A premium resource still appears in the list; its download link does not.
  visibleTo: (row, user) => (canSeeResource(user, row) ? row : redactResource(row)),
});

export const { GET, POST, PATCH, DELETE } = routes;
