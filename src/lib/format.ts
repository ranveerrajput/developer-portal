export function maskKey(value: string): string {
  return `•••• •••• •••• ${value.slice(-4)}`;
}

export function isoDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function uid(prefix: string): string {
  return `${prefix}_${crypto.getRandomValues(new Uint32Array(2)).join("")}`;
}
