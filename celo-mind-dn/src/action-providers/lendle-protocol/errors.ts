// 🛑 Base error class for Lendle protocol
export class LendleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LendleError';
  }
}

// 💸 Error for insufficient balance
export class InsufficientBalanceError extends LendleError {
  constructor(balance: string, required: string) {
    super(`Insufficient MNT balance. You have ${balance} but need ${required}`);
    this.name = 'InsufficientBalanceError';
  }
}

// 💸 Error for insufficient USDT balance
export class InsufficientUSDTBalanceError extends LendleError {
  constructor(balance: string, required: string) {
    super(`Insufficient USDT balance. You have ${balance} but need ${required}`);
    this.name = 'InsufficientUSDTBalanceError';
  }
}

// 🌐 Error for wrong network
export class WrongNetworkError extends LendleError {
  constructor() {
    super("This Lendle Protocol action provider is configured for Mantle. Please switch your network to Mantle.");
    this.name = 'WrongNetworkError';
  }
}

// ❌ Error for failed transactions
export class TransactionFailedError extends LendleError {
  constructor(message: string) {
    super(`Transaction failed: ${message}`);
    this.name = 'TransactionFailedError';
  }
}

// 🔐 Error for deposit not available
export class DepositNotAvailableError extends LendleError {
  constructor() {
    super(`MNT deposit is not available in Lendle Protocol on Mantle.`);
    this.name = 'DepositNotAvailableError';
  }
}

// 👎 Error for approval failed
export class ApprovalFailedError extends LendleError {
  constructor(message: string) {
    super(`Token approval failed: ${message}`);
    this.name = 'ApprovalFailedError';
  }
}

// 💰 Error for insufficient allowance
export class InsufficientAllowanceError extends LendleError {
  constructor(allowance: string, required: string) {
    super(`Insufficient token allowance. You have approved ${allowance} but need ${required}. Please approve more tokens.`);
    this.name = 'InsufficientAllowanceError';
  }
}

// 💔 Error for insufficient collateral
export class InsufficientCollateralError extends LendleError {
  constructor(collateral: string, withdrawAmount: string) {
    super(`Insufficient MNT collateral. You have ${collateral} deposited but are trying to withdraw ${withdrawAmount}.`);
    this.name = 'InsufficientCollateralError';
  }
}

// 🔒 Error for health factor too low
export class HealthFactorTooLowError extends LendleError {
  constructor(currentHealthFactor: string, minimumRequired: string) {
    super(`Health factor too low to perform this action. Current: ${currentHealthFactor}, Minimum required: ${minimumRequired}`);
    this.name = 'HealthFactorTooLowError';
  }
} 