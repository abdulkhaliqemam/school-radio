export function toEmbedUrl(fileId: string): string {
  if (!fileId) return "";
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function toImageUrl(fileId: string, width: number = 400): string {
  if (!fileId) return "";
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}
