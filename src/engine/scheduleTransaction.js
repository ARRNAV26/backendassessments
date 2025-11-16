function scheduleTransaction() {
  return {
    status: 'pending',
    status_code: 'AP02',
    status_reason: 'Transaction scheduled for future execution',
  };
}

module.exports = scheduleTransaction;
