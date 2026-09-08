export const urlBase64ToUint8Array = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

export const hasMatchingApplicationServerKey = (subscription: PushSubscription, publicKey: string) => {
  const applicationServerKey = subscription.options.applicationServerKey;
  if (!applicationServerKey) return false;

  const currentKey = new Uint8Array(applicationServerKey as ArrayBuffer);
  const expectedKey = urlBase64ToUint8Array(publicKey);
  return currentKey.length === expectedKey.length && currentKey.every((byte, index) => byte === expectedKey[index]);
};

/** Returns a subscription that is compatible with the currently deployed VAPID key. */
export const getCompatiblePushSubscription = async (registration: ServiceWorkerRegistration, publicKey: string) => {
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription && !hasMatchingApplicationServerKey(existingSubscription, publicKey)) {
    await existingSubscription.unsubscribe();
  }
  return registration.pushManager.getSubscription();
};
