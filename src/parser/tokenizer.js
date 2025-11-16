function tokenize(instruction) {
  // Trim, replace multiple spaces with single, split by space
  return instruction.trim().replace(/\s+/g, ' ').split(' ');
}

module.exports = tokenize;
