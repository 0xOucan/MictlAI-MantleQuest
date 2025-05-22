// 🛑 Base error class for Treehouse protocol
export class TreehouseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TreehouseError';
  }
}

// 💸 Error for insufficient balance
export class InsufficientBalanceError extends TreehouseError {
  constructor(token: string, balance: string, required: string) {
    super(`Insufficient ${token} balance. You have ${balance} but need ${required}`);
    this.name = 'InsufficientBalanceError';
  }
}

// 🔒 Error for insufficient allowance
export class InsufficientAllowanceError extends TreehouseError {
  constructor(token: string, allowance: string, required: string) {
    super(`Insufficient ${token} allowance. Current allowance is ${allowance} but need ${required}`);
    this.name = 'InsufficientAllowanceError';
  }
}

// 🌐 Error for wrong network
export class WrongNetworkError extends TreehouseError {
  constructor() {
    super("This Treehouse Protocol action provider is configured for Mantle. Please switch your network to Mantle.");
    this.name = 'WrongNetworkError';
  }
}

// ❌ Error for failed transactions
export class TransactionFailedError extends TreehouseError {
  constructor(message: string) {
    super(`Transaction failed: ${message}`);
    this.name = 'TransactionFailedError';
  }
}

// 🔐 Error for staking not available
export class StakingNotAvailableError extends TreehouseError {
  constructor(token: string) {
    super(`${token} is not available for staking in Treehouse Protocol on Mantle.`);
    this.name = 'StakingNotAvailableError';
  }
}

// 💔 Error for insufficient staked balance
export class InsufficientStakedBalanceError extends TreehouseError {
  constructor(token: string, stakedBalance: string, withdrawAmount: string) {
    super(`Insufficient staked ${token} balance. You have ${stakedBalance} staked but are trying to withdraw ${withdrawAmount}.`);
    this.name = 'InsufficientStakedBalanceError';
  }
} 