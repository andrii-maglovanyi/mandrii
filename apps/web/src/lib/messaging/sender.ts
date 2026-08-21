export const SENDER_COLOURS = [
  { avatarClassName: "bg-blue-600", emoji: "🔵", textClassName: "text-blue-700" },
  { avatarClassName: "bg-green-600", emoji: "🟢", textClassName: "text-green-700" },
  { avatarClassName: "bg-purple-600", emoji: "🟣", textClassName: "text-purple-700" },
  { avatarClassName: "bg-orange-600", emoji: "🟠", textClassName: "text-orange-700" },
  { avatarClassName: "bg-pink-600", emoji: "🩷", textClassName: "text-pink-700" },
  { avatarClassName: "bg-teal-600", emoji: "🟢", textClassName: "text-teal-700" },
] as const;

export function getSenderInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function getSenderColour(name: string) {
  let hash = 0;
  for (const character of name.toLowerCase()) {
    hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  }

  return SENDER_COLOURS[hash % SENDER_COLOURS.length];
}
