import { randomBytes } from 'node:crypto';
import { AwsClient } from 'aws4fetch';

/**
 * Cloudflare R2, spoken to as S3. The browser never sees these credentials: the
 * upload route signs a URL that is good for one PUT of one file for five
 * minutes, and the file goes to R2 directly. Nothing large is ever proxied
 * through a serverless function that has a body limit.
 */

/** Read at call time, not module load, so a missing config is a 503 rather than a boot crash. */
const config = () => {
  const accountId =
    process.env.R2_ACCOUNT_ID ||
    process.env.R2_ENDPOINTS?.match(/https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/i)?.[1] ||
    process.env.R2_ENDPOINT?.match(/https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/i)?.[1];
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
};

export const isConfigured = () => config() !== null;

/** What may be uploaded, and what it is allowed to weigh. */
export const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};
// No SVG on purpose: it is a script-bearing document, and these files are served
// from a domain of ours.

export const MAX_BYTES = 100 * 1024 * 1024;

const SAFE = /[^a-z0-9]+/g;

/**
 * `questions/2026-08-26/diagram-a3f19c.png` — grouped by what it belongs to and
 * when, with a random tail so two files of the same name never collide.
 */
export function objectKey(folder: string, filename: string, contentType: string): string {
  const extension = ALLOWED_TYPES[contentType];
  const base =
    filename.replace(/\.[^.]+$/, '').toLowerCase().replace(SAFE, '-').replace(/^-|-$/g, '').slice(0, 48) ||
    'file';
  const day = new Date().toISOString().split('T')[0];
  return `${folder}/${day}/${base}-${randomBytes(4).toString('hex')}.${extension}`;
}

export interface PresignedUpload {
  /** PUT the file here, with the same Content-Type. Expires in five minutes. */
  uploadUrl: string;
  /** Where the file will be readable once the PUT succeeds. Store this. */
  fileUrl: string;
  key: string;
}

export async function presignUpload(key: string, contentType: string): Promise<PresignedUpload | null> {
  const r2 = config();
  if (!r2) return null;

  const client = new AwsClient({
    accessKeyId: r2.accessKeyId,
    secretAccessKey: r2.secretAccessKey,
    service: 's3',
    region: 'auto',
  });

  const endpoint = new URL(
    `https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucket}/${key}`,
  );
  endpoint.searchParams.set('X-Amz-Expires', '300');

  const signed = await client.sign(
    new Request(endpoint, { method: 'PUT', headers: { 'Content-Type': contentType } }),
    // allHeaders puts Content-Type into the signature. Without it aws4fetch
    // signs only `host`, and the URL would accept a PUT of any type — an
    // uploader could store text/html under a .png key.
    { aws: { signQuery: true, allHeaders: true } },
  );

  return {
    uploadUrl: signed.url,
    fileUrl: `${r2.publicUrl.replace(/\/$/, '')}/${key}`,
    key,
  };
}
