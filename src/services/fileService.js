import api from './api';

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file, file.name);

  const response = await api.post('/files/upload', form, {
    timeout: 180000,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.file;
}

export function fileDownloadUrl(file) {
  if (!file?.download_url) return null;
  if (file.download_url.startsWith('http://') || file.download_url.startsWith('https://')) return file.download_url;
  if (file.download_url.startsWith('/api/')) return file.download_url;
  if (file.download_url.startsWith('/files/')) return `/api${file.download_url}`;
  return `/api/${file.download_url.replace(/^\/+/, '')}`;
}

export async function downloadFile(file) {
  const url = fileDownloadUrl(file);
  if (!url) throw new Error('Invalid file download URL.');

  const response = await api.get(url, { responseType: 'blob', timeout: 180000 });

  const blob = response.data;
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = file.filename || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
}
