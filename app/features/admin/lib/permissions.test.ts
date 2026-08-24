/**
 * Run with: node --test app/features/admin/lib/permissions.test.ts
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  permissionsFor,
  can,
  canOpenAdmin,
  grantedCount,
  ALL_PERMISSIONS,
  NO_PERMISSIONS,
  PERMISSION_KEYS,
  PERMISSION_LABELS,
} from './permissions.ts';

type User = Parameters<typeof permissionsFor>[0];
const user = (over: Record<string, unknown>) => ({ role: 'student', ...over }) as unknown as User;

test('every permission key has a label and hint', () => {
  for (const key of PERMISSION_KEYS) {
    assert.ok(PERMISSION_LABELS[key]?.label, `no label for ${key}`);
    assert.ok(PERMISSION_LABELS[key]?.hint, `no hint for ${key}`);
  }
});

test('a full admin implicitly has everything', () => {
  // Never read from user.permissions, so an admin cannot be edited into a lockout.
  assert.deepEqual(permissionsFor(user({ role: 'admin', permissions: NO_PERMISSIONS })), ALL_PERMISSIONS);
});

test('a student has nothing', () => {
  assert.deepEqual(permissionsFor(user({ role: 'student' })), NO_PERMISSIONS);
  assert.equal(canOpenAdmin(user({ role: 'student' })), false);
});

test('nobody signed in has nothing', () => {
  assert.deepEqual(permissionsFor(null), NO_PERMISSIONS);
  assert.equal(canOpenAdmin(null), false);
});

test('a staff member gets exactly what was granted', () => {
  const staff = user({ role: 'sub_admin', permissions: { canManageStudents: true } });
  assert.equal(can(staff, 'canManageStudents'), true);
  assert.equal(can(staff, 'canManagePurchases'), false);
  assert.equal(canOpenAdmin(staff), true);
});

test('a staff member with no permissions object gets nothing', () => {
  const staff = user({ role: 'sub_admin' });
  assert.deepEqual(permissionsFor(staff), NO_PERMISSIONS);
  assert.equal(canOpenAdmin(staff), false);
});

test('suspending revokes everything, admin included', () => {
  assert.deepEqual(permissionsFor(user({ role: 'admin', isSuspended: true })), NO_PERMISSIONS);
  assert.deepEqual(permissionsFor(user({ role: 'admin', status: 'suspended' })), NO_PERMISSIONS);
  assert.equal(canOpenAdmin(user({ role: 'admin', isSuspended: true })), false);
});

test('counts granted permissions for the staff list', () => {
  assert.equal(grantedCount(undefined), 0);
  assert.equal(grantedCount(NO_PERMISSIONS), 0);
  assert.equal(grantedCount(ALL_PERMISSIONS), PERMISSION_KEYS.length);
  assert.equal(
    grantedCount({ ...NO_PERMISSIONS, canManageStudents: true, canManageCourses: true }),
    2
  );
});
