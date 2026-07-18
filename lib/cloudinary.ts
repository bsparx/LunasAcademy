export function getCloudinaryCloud(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "demo";
}

function isFullUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function publicHlsUrl(publicIdOrUrl: string): string {
  if (isFullUrl(publicIdOrUrl)) return publicIdOrUrl;
  const cloud = getCloudinaryCloud();
  return `https://res.cloudinary.com/${cloud}/video/upload/${publicIdOrUrl}.m3u8`;
}

export function publicPosterUrl(publicIdOrUrl: string): string {
  if (isFullUrl(publicIdOrUrl)) return publicIdOrUrl;
  const cloud = getCloudinaryCloud();
  return `https://res.cloudinary.com/${cloud}/video/upload/${publicIdOrUrl}.jpg`;
}

export function publicMp4Url(publicIdOrUrl: string): string {
  if (isFullUrl(publicIdOrUrl)) return publicIdOrUrl;
  const cloud = getCloudinaryCloud();
  return `https://res.cloudinary.com/${cloud}/video/upload/${publicIdOrUrl}.mp4`;
}

export const DEMO_MUX_PLAYBACK_ID = "v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM";

export const DEMO_HLS_URL = `https://stream.mux.com/${DEMO_MUX_PLAYBACK_ID}.m3u8`;

export const DEMO_POSTER_URL =
  "https://image.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM/thumbnail.jpg?time=5";

export function muxPlaybackIdFrom(value?: string): string | undefined {
  if (!value) return undefined;
  if (!isFullUrl(value)) return value;
  const match = value.match(/^https?:\/\/(?:stream|image)\.mux\.com\/([^/?.]+)/);
  return match ? match[1] : undefined;
}
