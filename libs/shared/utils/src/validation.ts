export function isValidISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');

  if (cleaned.length === 10) {
    return isValidISBN10(cleaned);
  } else if (cleaned.length === 13) {
    return isValidISBN13(cleaned);
  }

  return false;
}

function isValidISBN10(isbn: string): boolean {
  if (!/^\d{9}[\dXx]$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }

  const check = isbn[9].toUpperCase();
  sum += check === 'X' ? 10 : parseInt(check);

  return sum % 11 === 0;
}

function isValidISBN13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }

  return sum % 10 === 0;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}
