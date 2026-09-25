/**
 * Generates a ULID (Universally Unique Lexicographically Sortable Identifier).
 * 26-char string, time-ordered. Used as primary keys throughout the app.
 * No external dependencies; avoids BigInt for ES2017 compatibility.
 */
export function ulid(): string {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const now = Date.now();

  // 10 chars for timestamp (48-bit, ms precision)
  let timeStr = "";
  let t = now;
  for (let i = 9; i >= 0; i--) {
    timeStr = ENCODING[t % 32] + timeStr;
    t = Math.floor(t / 32);
  }

  // 16 chars for random component.
  // Pack 5 bytes (40 bits) → 8 base-32 chars, twice (10 bytes total).
  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);

  function encodeFiveBytes(b: Uint8Array, offset: number): string {
    const hi = (b[offset] << 8) | b[offset + 1]; // 16 bits
    const lo =
      (b[offset + 2] << 16) | (b[offset + 3] << 8) | b[offset + 4]; // 24 bits
    return (
      ENCODING[(hi >> 11) & 31] +
      ENCODING[(hi >> 6) & 31] +
      ENCODING[(hi >> 1) & 31] +
      ENCODING[((hi & 1) << 4) | (lo >> 20)] +
      ENCODING[(lo >> 15) & 31] +
      ENCODING[(lo >> 10) & 31] +
      ENCODING[(lo >> 5) & 31] +
      ENCODING[lo & 31]
    );
  }

  return timeStr + encodeFiveBytes(randomBytes, 0) + encodeFiveBytes(randomBytes, 5);
}
