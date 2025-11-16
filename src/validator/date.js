function validateDateFormat(dateStr) {
  if (!dateStr) return true; // optional
  const parts = dateStr.split('-');
  return (
    parts.length === 3 &&
    parts[0].length === 4 &&
    !Number.isNaN(parts[0]) &&
    parts[0] === parseInt(parts[0], 10).toString() &&
    parts[1].length === 2 &&
    !Number.isNaN(parts[1]) &&
    parts[1] === parseInt(parts[1], 10).toString() &&
    parts[2].length === 2 &&
    !Number.isNaN(parts[2]) &&
    parts[2] === parseInt(parts[2], 10).toString()
  );
}

function shouldExecute(dateStr) {
  if (!dateStr) return true;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr <= today;
}

module.exports = { validateDateFormat, shouldExecute };
