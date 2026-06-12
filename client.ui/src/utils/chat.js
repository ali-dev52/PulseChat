// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  ["#d0e8ff", "#0e5fa6"],
  ["#ffd6e0", "#a0003c"],
  ["#d6f5e8", "#0a6e43"],
  ["#ffe8cc", "#8a4a00"],
  ["#e8d6ff", "#5e00a0"],
  ["#d6f0ff", "#005f8a"],
  ["#fde8d6", "#8a3a00"],
  ["#e8ffd6", "#2a6a00"],
];

/** Deterministic [bg, fg] color pair from any string ID */
export const avatarColor = (id = "") => {
  let hash = 0;
  for (const c of String(id)) hash = (hash * 31 + c.charCodeAt(0)) & 0xfff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/** "Fatima Ali" → "FA" */
export const getInitials = (name = "") =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── Time formatting ──────────────────────────────────────────────────────────

/**
 * Smart timestamp:
 *  - Same day    → "14:32"
 *  - Yesterday   → "Yesterday"
 *  - This week   → "Mon"
 *  - Older       → "12/04"
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date)) return "";

  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString([], { weekday: "short" });

  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
};

/**
 * Full time for message bubbles → "14:32"
 */
export const formatBubbleTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ─── Message grouping ─────────────────────────────────────────────────────────

/**
 * Groups messages by date for dividers like "Today", "Yesterday", "12 Apr"
 * Returns: [{ label: "Today", messages: [...] }, ...]
 */
export const groupMessagesByDate = (messages = []) => {
  const groups = [];
  let currentLabel = null;
  let currentGroup = [];

  messages.forEach((msg) => {
    const label = getDateLabel(msg.createdAt);

    if (label !== currentLabel) {
      if (currentGroup.length > 0) {
        groups.push({ label: currentLabel, messages: currentGroup });
      }
      currentLabel = label;
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  });

  if (currentGroup.length > 0) {
    groups.push({ label: currentLabel, messages: currentGroup });
  }

  return groups;
};

const getDateLabel = (dateStr) => {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  if (isNaN(date)) return "Unknown";

  const now = new Date();
  const diffDays = Math.floor((now - date) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString([], { day: "numeric", month: "long" });
};

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Truncate long strings for previews */
export const truncate = (str = "", max = 40) =>
  str.length > max ? str.slice(0, max).trimEnd() + "…" : str;