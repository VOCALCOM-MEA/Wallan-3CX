export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[\s-]/g, '');

  if (!digits.startsWith('+') && digits.startsWith('966')) {
    digits = `+${digits}`;
  }

  return digits;
}


