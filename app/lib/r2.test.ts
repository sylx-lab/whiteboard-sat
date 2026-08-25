import { test } from 'node:test';
import assert from 'node:assert';

// Set before importing: r2.ts reads process.env when called, but keeping this
// first documents that these are throwaway values, not anyone's keys.
process.env.R2_ACCOUNT_ID = 'test-account';
process.env.R2_ACCESS_KEY_ID = 'test-access-key';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.R2_BUCKET = 'test-bucket';
process.env.R2_PUBLIC_URL = 'https://files.example.com/';

const { ALLOWED_TYPES, isConfigured, objectKey, presignUpload } = await import('./r2.ts');

test('a key is namespaced, slugged, extended from the content type, and unique', () => {
  const key = objectKey('questions', 'Figure 3 — Right Triangle.PNG', 'image/png');
  const [folder, day, file] = key.split('/');
  assert.equal(folder, 'questions');
  assert.match(day, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(file, /^figure-3-right-triangle-[0-9a-f]{8}\.png$/);
  // Two uploads of the same filename must not overwrite each other.
  assert.notEqual(key, objectKey('questions', 'Figure 3 — Right Triangle.PNG', 'image/png'));
});

test('a filename with nothing usable in it still produces a key', () => {
  assert.match(objectKey('resources', '???.pdf', 'application/pdf'), /^resources\/[\d-]+\/file-[0-9a-f]{8}\.pdf$/);
});

test('SVG is not an accepted type', () => {
  // It carries script, and these files are served from a domain of ours.
  assert.equal(ALLOWED_TYPES['image/svg+xml'], undefined);
  assert.equal(ALLOWED_TYPES['application/pdf'], 'pdf');
});

test('the presigned URL points at the bucket and carries a signature that expires', async () => {
  const signed = await presignUpload('questions/2026-08-26/figure-abcd1234.png', 'image/png');
  assert.ok(signed);
  const url = new URL(signed.uploadUrl);

  assert.equal(url.host, 'test-account.r2.cloudflarestorage.com');
  assert.equal(url.pathname, '/test-bucket/questions/2026-08-26/figure-abcd1234.png');
  assert.equal(url.searchParams.get('X-Amz-Expires'), '300');
  assert.match(url.searchParams.get('X-Amz-Algorithm') ?? '', /^AWS4-HMAC-SHA256$/);
  assert.match(url.searchParams.get('X-Amz-Credential') ?? '', /^test-access-key\/\d{8}\/auto\/s3\/aws4_request$/);
  assert.match(url.searchParams.get('X-Amz-Signature') ?? '', /^[0-9a-f]{64}$/);
  // Content-Type is part of the signature, so the PUT cannot claim a different one.
  assert.match(url.searchParams.get('X-Amz-SignedHeaders') ?? '', /content-type/);
  // The secret itself must never appear in something the browser receives.
  assert.ok(!signed.uploadUrl.includes('test-secret-key'));
});

test('the stored URL is the public one, with no double slash', async () => {
  const signed = await presignUpload('resources/2026-08-26/sheet-abcd1234.pdf', 'application/pdf');
  assert.equal(signed?.fileUrl, 'https://files.example.com/resources/2026-08-26/sheet-abcd1234.pdf');
});

test('a signature changes with the object being signed', async () => {
  const a = await presignUpload('questions/a.png', 'image/png');
  const b = await presignUpload('questions/b.png', 'image/png');
  const sig = (u: string) => new URL(u).searchParams.get('X-Amz-Signature');
  assert.notEqual(sig(a!.uploadUrl), sig(b!.uploadUrl));
});

test('missing configuration is reported, not guessed at', async () => {
  const saved = process.env.R2_BUCKET;
  delete process.env.R2_BUCKET;
  assert.equal(isConfigured(), false);
  assert.equal(await presignUpload('questions/x.png', 'image/png'), null);
  process.env.R2_BUCKET = saved;
  assert.equal(isConfigured(), true);
});
