const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const paymentInstructionsService = require('@app/services/payment/payment-instructions');

module.exports = createHandler({
  path: '/payment-instructions',
  method: 'post',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'payment-instructions-request-completed');
  },
  async handler(rc, helpers) {
    const { accounts, instruction } = rc.body;

    // Validate body
    if (!accounts || !Array.isArray(accounts) || !instruction || typeof instruction !== 'string') {
      return {
        status: helpers.http_statuses.HTTP_400_BAD_REQUEST,
        data: {
          type: null,
          amount: null,
          currency: null,
          debit_account: null,
          credit_account: null,
          execute_by: null,
          status: 'failed',
          status_reason: 'Invalid request body',
          status_code: 'SY03',
          accounts: [],
        },
      };
    }

    const response = await paymentInstructionsService({ accounts, instruction });

    const status =
      response.status === 'failed'
        ? helpers.http_statuses.HTTP_400_BAD_REQUEST
        : helpers.http_statuses.HTTP_200_OK;

    return {
      status,
      data: response,
    };
  },
});
