import { api } from './api';

export type UploadFolder = 'questions' | 'resources' | 'lessons' | 'courses';

/**
 * Ask the server for a signed URL, PUT the file straight to R2, hand back the
 * URL it now lives at. The file never passes through the app's own server, so
 * a 20 MB PDF is not a serverless request body.
 */
export async function uploadFile(file: File, folder: UploadFolder): Promise<string> {
  const { uploadUrl, fileUrl } = await api.post<{ uploadUrl: string; fileUrl: string }>('/uploads', {
    filename: file.name,
    contentType: file.type,
    size: file.size,
    folder,
  });

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    // Must match what was signed, or R2 rejects the signature.
    headers: { 'Content-Type': file.type },
  });
  if (!response.ok) throw new Error(`Upload failed (${response.status})`);

  return fileUrl;
}
