/**
 * Utilitários globais para o ecossistema Movieats
 */

/**
 * Retorna a URL pública completa para uma imagem armazenada no Cloudflare R2
 * Se o caminho já for uma URL absoluta (começa com http), retorna o caminho original.
 */
export function getPublicUrl(path: string | undefined | null): string {
  if (!path) return "";
  
  // Se for uma URL completa (da Unsplash ou já com domínio), retorna original
  if (path.startsWith("http")) return path;

  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
  
  // Remove barras extras do início do path e do final da baseUrl
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  if (!cleanBase) {
    console.warn("NEXT_PUBLIC_R2_PUBLIC_URL não está configurada.");
    return `/${cleanPath}`;
  }

  return `${cleanBase}/${cleanPath}`;
}
