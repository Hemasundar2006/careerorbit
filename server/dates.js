const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function isValidDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// Keep a listing visible through its whole last date in India.
function expiresAtFor(lastDate) {
  if (!isValidDateOnly(lastDate)) throw new Error('Invalid last date');
  return new Date(Date.parse(`${lastDate}T00:00:00.000Z`) + 24 * 60 * 60 * 1000 - IST_OFFSET_MS);
}

module.exports = { isValidDateOnly, expiresAtFor };
