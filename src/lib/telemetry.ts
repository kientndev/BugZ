import { sendGAEvent } from '@next/third-parties/google';

export function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    sendGAEvent({ event: eventName, ...params });
  } catch (err) {
    console.error('Failed to trigger GA telemetry event:', err);
  }
}
