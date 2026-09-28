/**
 * safety.js
 * ─────────
 * Real-time content moderation and safety filter for anonymous chat.
 * Scans messages for abusive terminology, harassment, spam, and PII leaks.
 */

const TOXIC_PATTERNS = [
  /\b(kill\s+yourself|die|kys|f[u*]ck\s+you|hate\s+you)\b/i,
  /\b(threat|bomb|attack|murder)\b/i
];

const PII_PATTERNS = [
  /\b\d{3}[-.\s]??\d{3}[-.\s]??\d{4}\b/, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email addresses
];

function evaluateMessageSafety(text) {
  if (!text || typeof text !== "string") {
    return { isAllowed: false, reason: "EMPTY_OR_INVALID" };
  }

  // 1. PII detection
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isAllowed: false,
        sanitizedText: "[PII Redacted for Security]",
        reason: "PII_LEAK_DETECTED",
        warning: "Sharing phone numbers or email addresses in anonymous chat is restricted for safety."
      };
    }
  }

  // 2. Toxic language detection
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isAllowed: false,
        sanitizedText: "[Message blocked due to safety guidelines]",
        reason: "TOXIC_LANGUAGE_DETECTED",
        warning: "Your message violated community safety standards."
      };
    }
  }

  // 3. Repeated character / spam check
  if (/(.)\1{12,}/.test(text)) {
    return {
      isAllowed: false,
      sanitizedText: text.slice(0, 20) + "...",
      reason: "REPEATED_CHARACTER_SPAM",
      warning: "Excessive repetitive character spam was suppressed."
    };
  }

  return {
    isAllowed: true,
    sanitizedText: text,
    reason: "SAFE"
  };
}

module.exports = { evaluateMessageSafety };
