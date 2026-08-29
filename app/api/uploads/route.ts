import { canOpenAdmin } from '../../features/admin/lib/permissions.ts';
import { bad, denied, readBody, requireUser } from '../../lib/api.ts';
import { ALLOWED_TYPES, MAX_BYTES, isConfigured, objectKey, presignUpload } from '../../lib/r2.ts';

/**
 * POST /api/uploads — { filename, contentType, size, folder } → a URL to PUT the
 * file to, and the URL it will live at afterwards.
 *
 * Staff only. Uploading is how a question figure or a resource PDF gets into the
 * product, so it is an authoring action, not something a student account can do.
 */
const FOLDERS = ['questions', 'resources', 'lessons', 'courses'] as const;

export async function POST(request: Request) {
  const user = await requireUser();
  if (denied(user)) return user;
  if (!canOpenAdmin(user)) return bad('You do not have permission to upload files', 403);
  if (!isConfigured()) {
    return bad('File storage is not configured. Set the R2_* variables in .env.', 503);
  }

  const body = await readBody(request);
  const contentType = String(body?.contentType ?? '');
  const filename = String(body?.filename ?? '');
  const size = Number(body?.size ?? 0);
  const folder = String(body?.folder ?? '');

  if (!filename) return bad('filename is required');
  if (!ALLOWED_TYPES[contentType]) {
    return bad(`That file type is not allowed. Accepted: ${Object.keys(ALLOWED_TYPES).join(', ')}`);
  }
  if (!(FOLDERS as readonly string[]).includes(folder)) {
    return bad(`folder must be one of ${FOLDERS.join(', ')}`);
  }
  // ponytail: the declared size is what is checked, and only a signed-in staff
  // member can get a URL at all. Move to a POST policy with a
  // content-length-range condition if uploads ever open up beyond staff.
  if (!size || size > MAX_BYTES) {
    return bad(`Files must be between 1 byte and ${MAX_BYTES / 1024 / 1024} MB`);
  }

  const presigned = await presignUpload(objectKey(folder, filename, contentType), contentType);
  if (!presigned) return bad('File storage is not configured', 503);
  return Response.json(presigned);
}
