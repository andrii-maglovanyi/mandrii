const LOCATION_KEY = "mandrii-location-enabled";
const CHANGE_EVENT = "mandrii-device-preferences-changed";

export function isDeviceLocationEnabled() {
  try {
    return localStorage.getItem(LOCATION_KEY) !== "false";
  } catch {
    return true;
  }
}
export function setDeviceLocationEnabled(enabled: boolean) {
  localStorage.setItem(LOCATION_KEY, String(enabled));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function subscribeDevicePreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}
