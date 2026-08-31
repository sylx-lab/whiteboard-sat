import type { UserProfile, AdminPermission } from '../../../types';

/**
 * `AdminPermission` and the `sub_admin` role were already in the data model but
 * wired to nothing. This is the single place that decides what a signed-in person
 * may do in the admin console.
 */

export const PERMISSION_KEYS: (keyof AdminPermission)[] = [
  'canManageStudents',
  'canManagePurchases',
  'canManagePractice',
  'canManageCourses',
  'canManageMockTests',
  'canManageResources',
  'canManageSubAdmins',
];

export const PERMISSION_LABELS: Record<keyof AdminPermission, { label: string; hint: string }> = {
  canManageStudents: {
    label: 'Students',
    hint: 'View student accounts, grant or revoke passes, suspend access.',
  },
  canManagePurchases: {
    label: 'Payments',
    hint: 'Verify or reject bKash, Nagad, and bank transfers.',
  },
  canManagePractice: {
    label: 'Question bank',
    hint: 'Author, edit, import, and delete practice questions and topics.',
  },
  canManageCourses: { label: 'Courses', hint: 'Manage the course catalog and its video lessons.' },
  canManageMockTests: { label: 'Mock tests', hint: 'Build and edit timed mock exams.' },
  canManageResources: { label: 'Resources', hint: 'Publish formula sheets, guides, and PDFs.' },
  canManageSubAdmins: {
    label: 'Team',
    hint: 'Add staff members and change what they can manage. Grant with care.',
  },
};

const allOf = (value: boolean): AdminPermission =>
  PERMISSION_KEYS.reduce((acc, key) => ({ ...acc, [key]: value }), {} as AdminPermission);

export const ALL_PERMISSIONS = allOf(true);
export const NO_PERMISSIONS = allOf(false);

/** Default access for new staff members: all areas enabled except managing other staff / team. */
export const DEFAULT_STAFF_PERMISSIONS: AdminPermission = {
  canManageStudents: true,
  canManagePurchases: true,
  canManagePractice: true,
  canManageCourses: true,
  canManageMockTests: true,
  canManageResources: true,
  canManageSubAdmins: false,
};

/**
 * Effective permissions for a person.
 *
 * A full admin always has everything — their permission set is implicit, so it can
 * never be edited into a state where nobody can administer the platform. A staff
 * member (`sub_admin`) has exactly what was granted, defaulting to nothing.
 */
export function permissionsFor(user: UserProfile | null): AdminPermission {
  if (!user) return NO_PERMISSIONS;
  if (user.isSuspended || user.status === 'suspended') return NO_PERMISSIONS;
  if (user.role === 'admin') return ALL_PERMISSIONS;
  if (user.role === 'sub_admin') return { ...NO_PERMISSIONS, ...(user.permissions ?? {}) };
  return NO_PERMISSIONS;
}

export function can(user: UserProfile | null, permission: keyof AdminPermission): boolean {
  return permissionsFor(user)[permission];
}

/** True when the person may open the admin console at all. */
export function canOpenAdmin(user: UserProfile | null): boolean {
  return PERMISSION_KEYS.some((key) => permissionsFor(user)[key]);
}

export function grantedCount(permissions: AdminPermission | undefined): number {
  if (!permissions) return 0;
  return PERMISSION_KEYS.filter((key) => permissions[key]).length;
}
