type WhopPixel = {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
};

export type RoofingPixelEvent =
  | "estimate_requested"
  | "service_viewed"
  | "deposit_started";

declare global {
  interface Window {
    whop?: WhopPixel;
  }
}

/** Whop installs its own pixel on Whop-hosted websites; do not add a duplicate script. */
export function trackWhop(
  eventName: RoofingPixelEvent,
  properties: Record<string, unknown> = {},
  eventId?: string,
) {
  const uniqueEventId = eventId || `${eventName}-${crypto.randomUUID()}`;
  if (typeof window !== "undefined" && window.whop?.track) {
    window.whop.track(eventName, { ...properties, event_id: uniqueEventId });
  }
  if (typeof window !== "undefined") {
    console.info(`[Whop pixel] ${eventName}`, { ...properties, event_id: uniqueEventId });
  }
}
