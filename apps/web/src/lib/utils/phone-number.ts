export interface CountryPhoneConfig {
  code: string;
  country: string;
  flag: string;
  format: string;
  maxDigits: number;
  minDigits: number;
  pattern: RegExp;
}

const COUNTRY_PATTERNS = [
  {
    code: "+1",
    country: "US/CA",
    flag: "🇺🇸",
    format: "(XXX) XXX-XXXX",
    maxDigits: 10,
    minDigits: 10,
    pattern: /^\+?1/,
  },
  { code: "+44", country: "UK", flag: "🇬🇧", format: "XXXX XXX XXX", maxDigits: 10, minDigits: 10, pattern: /^\+?44/ },
  { code: "+61", country: "AU", flag: "🇦🇺", format: "XXX XXX XXX", maxDigits: 9, minDigits: 9, pattern: /^\+?61/ },
  { code: "+49", country: "DE", flag: "🇩🇪", format: "XXX XXXXXXXX", maxDigits: 11, minDigits: 10, pattern: /^\+?49/ },
  { code: "+33", country: "FR", flag: "🇫🇷", format: "X XX XX XX XX", maxDigits: 9, minDigits: 9, pattern: /^\+?33/ },
  { code: "+39", country: "IT", flag: "🇮🇹", format: "XXX XXX XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?39/ },
  { code: "+34", country: "ES", flag: "🇪🇸", format: "XXX XX XX XX", maxDigits: 9, minDigits: 9, pattern: /^\+?34/ },
  { code: "+31", country: "NL", flag: "🇳🇱", format: "X XX XX XX XX", maxDigits: 9, minDigits: 9, pattern: /^\+?31/ },
  { code: "+32", country: "BE", flag: "🇧🇪", format: "XXX XX XX XX", maxDigits: 9, minDigits: 9, pattern: /^\+?32/ },
  { code: "+41", country: "CH", flag: "🇨🇭", format: "XX XXX XX XX", maxDigits: 9, minDigits: 9, pattern: /^\+?41/ },
  { code: "+43", country: "AT", flag: "🇦🇹", format: "XXX XXXXXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?43/ },
  { code: "+46", country: "SE", flag: "🇸🇪", format: "XX XXX XX XX", maxDigits: 9, minDigits: 9, pattern: /^\+?46/ },
  { code: "+47", country: "NO", flag: "🇳🇴", format: "XXX XX XXX", maxDigits: 8, minDigits: 8, pattern: /^\+?47/ },
  { code: "+45", country: "DK", flag: "🇩🇰", format: "XX XX XX XX", maxDigits: 8, minDigits: 8, pattern: /^\+?45/ },
  { code: "+358", country: "FI", flag: "🇫🇮", format: "XX XXX XX XX", maxDigits: 10, minDigits: 9, pattern: /^\+?358/ },
  { code: "+48", country: "PL", flag: "🇵🇱", format: "XXX XXX XXX", maxDigits: 9, minDigits: 9, pattern: /^\+?48/ },
  { code: "+380", country: "UA", flag: "🇺🇦", format: "XX XXX XX XX", maxDigits: 9, minDigits: 9, pattern: /^\+?380/ },
  { code: "+7", country: "RU", flag: "💩", format: "XXX XXX-XX-XX", maxDigits: 10, minDigits: 10, pattern: /^\+?7/ },
  { code: "+86", country: "CN", flag: "🇨🇳", format: "XXX XXXX XXXX", maxDigits: 11, minDigits: 11, pattern: /^\+?86/ },
  { code: "+81", country: "JP", flag: "🇯🇵", format: "XX-XXXX-XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?81/ },
  { code: "+82", country: "KR", flag: "🇰🇷", format: "XX-XXXX-XXXX", maxDigits: 10, minDigits: 9, pattern: /^\+?82/ },
  { code: "+91", country: "IN", flag: "🇮🇳", format: "XXXXX XXXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?91/ },
  { code: "+55", country: "BR", flag: "🇧🇷", format: "XX XXXXX-XXXX", maxDigits: 11, minDigits: 11, pattern: /^\+?55/ },
  { code: "+52", country: "MX", flag: "🇲🇽", format: "XX XXXX XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?52/ },
  { code: "+54", country: "AR", flag: "🇦🇷", format: "XX XXXX-XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?54/ },
  { code: "+27", country: "ZA", flag: "🇿🇦", format: "XX XXX XXXX", maxDigits: 9, minDigits: 9, pattern: /^\+?27/ },
  { code: "+234", country: "NG", flag: "🇳🇬", format: "XXX XXX XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?234/ },
  { code: "+20", country: "EG", flag: "🇪🇬", format: "XXX XXX XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?20/ },
  { code: "+966", country: "SA", flag: "🇸🇦", format: "XX XXX XXXX", maxDigits: 9, minDigits: 9, pattern: /^\+?966/ },
  { code: "+971", country: "AE", flag: "🇦🇪", format: "XX XXX XXXX", maxDigits: 9, minDigits: 9, pattern: /^\+?971/ },
  { code: "+972", country: "IL", flag: "🇮🇱", format: "XX-XXX-XXXX", maxDigits: 9, minDigits: 9, pattern: /^\+?972/ },
  { code: "+90", country: "TR", flag: "🇹🇷", format: "XXX XXX XX XX", maxDigits: 10, minDigits: 10, pattern: /^\+?90/ },
  { code: "+30", country: "GR", flag: "🇬🇷", format: "XXX XXX XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?30/ },
  { code: "+351", country: "PT", flag: "🇵🇹", format: "XXX XXX XXX", maxDigits: 9, minDigits: 9, pattern: /^\+?351/ },
  { code: "+353", country: "IE", flag: "🇮🇪", format: "XX XXX XXXX", maxDigits: 9, minDigits: 9, pattern: /^\+?353/ },
  { code: "+64", country: "NZ", flag: "🇳🇿", format: "XX XXX XXXX", maxDigits: 10, minDigits: 9, pattern: /^\+?64/ },
  { code: "+65", country: "SG", flag: "🇸🇬", format: "XXXX XXXX", maxDigits: 8, minDigits: 8, pattern: /^\+?65/ },
  { code: "+60", country: "MY", flag: "🇲🇾", format: "XX-XXXX XXXX", maxDigits: 10, minDigits: 9, pattern: /^\+?60/ },
  { code: "+66", country: "TH", flag: "🇹🇭", format: "XX XXX XXXX", maxDigits: 9, minDigits: 9, pattern: /^\+?66/ },
  { code: "+63", country: "PH", flag: "🇵🇭", format: "XXX XXX XXXX", maxDigits: 10, minDigits: 10, pattern: /^\+?63/ },
  { code: "+62", country: "ID", flag: "🇮🇩", format: "XXX-XXX-XXXX", maxDigits: 11, minDigits: 10, pattern: /^\+?62/ },
  { code: "+84", country: "VN", flag: "🇻🇳", format: "XX XXXX XXXX", maxDigits: 9, minDigits: 9, pattern: /^\+?84/ },
];

export function formatPhoneNumber(value: string): string {
  const normalized = normalizeNumber(value);
  let cleaned = normalized.replaceAll(/[^\d+]/g, "");

  if (cleaned && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  if (!cleaned || cleaned === "+") return cleaned;

  const country = detectCountry(cleaned);

  if (!country) {
    const digits = cleaned.slice(1);
    const match = /(\d{1,4})(\d{0,3})(\d{0,3})(\d{0,4})/.exec(digits);

    if (match) {
      let formatted = "+";
      if (match[1]) formatted += match[1];
      if (match[2]) formatted += " " + match[2];
      if (match[3]) formatted += " " + match[3];
      if (match[4]) formatted += " " + match[4];
      return formatted.trim();
    }
    return cleaned;
  }

  const codeLength = country.code.replaceAll(/\D/g, "").length;
  const allDigits = cleaned.replaceAll(/\D/g, "");
  const phoneDigits = allDigits.slice(codeLength);

  let formatted = country.code + " ";
  let digitIndex = 0;

  for (let i = 0; i < country.format.length && digitIndex < phoneDigits.length; i++) {
    const char = country.format[i];
    if (char === "X") {
      formatted += phoneDigits[digitIndex];
      digitIndex++;
    } else {
      formatted += char;
    }
  }

  if (digitIndex < phoneDigits.length) {
    formatted += " " + phoneDigits.slice(digitIndex);
  }

  return formatted;
}

export function processPhoneNumber(value: string) {
  const formatted = formatPhoneNumber(value);
  const isValid = validatePhoneNumber(formatted);
  const detectedCountry = detectCountry(formatted);

  return {
    detectedCountry,
    formatted,
    isValid,
  };
}

export function validatePhoneNumber(value: string) {
  const normalized = normalizeNumber(value);
  if (!normalized || normalized === "+") {
    return null;
  }

  const cleaned = value.replaceAll(/\D/g, "");
  const country = detectCountry(value);

  if (!country) {
    return cleaned.length >= 8;
  }

  const codeLength = country.code.replaceAll(/\D/g, "").length;
  const phoneDigits = cleaned.slice(codeLength);

  return phoneDigits.length >= country.minDigits && phoneDigits.length <= country.maxDigits;
}

function detectCountry(value: string) {
  const normalized = normalizeNumber(value);
  const digits = normalized.replaceAll(/\D/g, "");

  const sorted = [...COUNTRY_PATTERNS].sort((a, b) => b.code.length - a.code.length);

  for (const country of sorted) {
    const codeDigits = country.code.replaceAll(/\D/g, "");
    if (digits.startsWith(codeDigits)) {
      return country;
    }
  }
  return null;
}

function normalizeNumber(value: string) {
  if (!value) {
    return "";
  }

  let cleaned = value.replaceAll(/[^\d+]/g, "");

  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned.replace(/^0+/, "");
  }

  return cleaned;
}
