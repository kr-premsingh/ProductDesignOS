export function track(event: string, properties: Record<string, unknown> = {}) {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
  console.info("[analytics]", event, properties);
}
