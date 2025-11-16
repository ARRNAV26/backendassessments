# Payment Instructions API

## Overview

The `endpoints/payment/payment-instructions.js` endpoint processes payment transaction instructions.

**Endpoint:** POST `/payment-instructions`

## Request Format

```json
{
  "accounts": [
    {
      "id": "account_id",
      "balance": number,
      "currency": "USD|NGN|GBP|GHS"
    }
  ],
  "instruction": "INSTRUCTION_TEXT"
}
```

## Instruction Syntax

### Debit Transaction
```
DEBIT amount currency FROM ACCOUNT debitAccount FOR CREDIT TO ACCOUNT creditAccount [ON yyyy-mm-dd]
```

### Credit Transaction
```
CREDIT amount currency TO ACCOUNT creditAccount FOR DEBIT FROM ACCOUNT debitAccount [ON yyyy-mm-dd]
```

## Response Format

```json
{
  "status": "success",
  "message": "Transaction failed", // Operation-specific message
  "data": {
    "type": "debit|credit",
    "amount": number,
    "currency": "USD|NGN|GBP|GHS",
    "debit_account": "account_id",
    "credit_account": "account_id",
    "execute_by": "yyyy-mm-dd|null",
    "status": "successful|failed|pending",
    "status_reason": "Human readable message",
    "status_code": "AP00|AC03|...", // Application error code
    "accounts": [
      {
        "id": "account_id",
        "balance": number,
        "balance_before": number,
        "currency": "USD"
      }
    ]
  }
}
```

## Error Conditions

| Code | Condition |
|------|-----------|
| SY03 | Malformed instruction or invalid request body |
| SY01 | Missing required keyword |
| SY02 | Invalid keyword order |
| SY03 | Unknown transaction type |
| AM01 | Amount must be positive integer |
| CU02 | Unsupported currency |
| AC04 | Invalid account ID format |
| AC03 | Account not found |
| CU01 | Currency mismatch |
| AC01 | Insufficient funds |
| AC02 | Same debit and credit account |
| DT01 | Invalid date format |

## Business Logic Flow

1. **Parse Instruction**: Split instruction into tokens and validate syntax
2. **Validate Accounts**: Check account existence and format
3. **Currency Validation**: Ensure all accounts use matching currency
4. **Balance Check**: Verify sufficient funds in debit account
5. **Account Duplication Check**: Prevent same account for debit/credit
6. **Execution Logic**: Execute now or schedule for future based on date
7. **Balance Updates**: Update account balances on execution
8. **Response Generation**: Return detailed transaction result

## Features

- **Currency Support**: NGN, USD, GBP, GHS
- **Future Scheduling**: ON date parameter for delayed execution
- **Comprehensive Validation**: Syntax, accounts, balances, currencies
- **Detailed Responses**: Full transaction state and error reporting
