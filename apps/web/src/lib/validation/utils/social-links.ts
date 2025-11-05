export const FACEBOOK_HOSTS = ["facebook.com", "www.facebook.com", "fb.com", "www.fb.com", "m.facebook.com"];
export const INSTAGRAM_HOSTS = ["instagram.com", "www.instagram.com", "instagr.am", "www.instagr.am"];

export const validateHost = (val: string, hosts: string[]) => {
  if (!val) return true;

  try {
    const url = new URL(val);
    const hostname = url.hostname.toLowerCase();
    return hosts.includes(hostname);
  } catch {
    return false;
  }
};
