let pending: Promise<ServiceWorkerRegistration> | undefined;

export async function readyAppWorker() {
  await registerAppWorker();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Unable to prepare notifications. Please try again.")), 15_000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Shared by app startup and explicit notification enrollment. */
export function registerAppWorker() {
  if (!pending) {
    pending = navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((error) => {
      pending = undefined;
      throw error;
    });
  }
  return pending;
}
