type WhopPixel = {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    whop?: WhopPixel;
  }
}

/** Whop installs its own pixel on Whop-hosted websites; do not add a duplicate script. */
export function trackWhop(
  eventName: "estimate_requested" | "service_viewed" | "deposit_started" | string,
  properties: Record<string, unknown> = {},
) {
  const eventId = `${eventName}-${crypto.randomUUID()}`;
  if (typeof window !== "undefined" && window.whop?.track) {
    window.whop.track(eventName, { ...properties, event_id: eventId });
  }
  // Useful in DevTools and a quick way to demonstrate the custom event during a recording.
  if (typeof window !== "undefined") {
    console.info(`[Whop pixel] ${eventName}`, { ...properties, event_id: eventId });
  }
}
