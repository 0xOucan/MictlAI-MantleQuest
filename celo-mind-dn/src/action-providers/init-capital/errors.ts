/**
 * Custom error classes for INIT Capital operations
 */

// Base error class for all INIT Capital related errors
export class InitCapitalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InitCapitalError';
  }
}

// Error when position creation fails
export class PositionCreationError extends InitCapitalError {
  constructor(message: string) {
    super(`Failed to create position: ${message}`);
    this.name = 'PositionCreationError';
  }
}

// Error when collateral addition fails
export class CollateralAddError extends InitCapitalError {
  constructor(message: string) {
    super(`Failed to add collateral: ${message}`);
    this.name = 'CollateralAddError';
  }
}

// Error when collateral removal fails
export class CollateralRemoveError extends InitCapitalError {
  constructor(message: string) {
    super(`Failed to remove collateral: ${message}`);
    this.name = 'CollateralRemoveError';
  }
}

// Error when borrowing fails
export class BorrowError extends InitCapitalError {
  constructor(message: string) {
    super(`Failed to borrow: ${message}`);
    this.name = 'BorrowError';
  }
}

// Error when repaying fails
export class RepayError extends InitCapitalError {
  constructor(message: string) {
    super(`Failed to repay: ${message}`);
    this.name = 'RepayError';
  }
}

// Error for insufficient collateral
export class InsufficientCollateralError extends InitCapitalError {
  constructor(message: string) {
    super(`Insufficient collateral: ${message}`);
    this.name = 'InsufficientCollateralError';
  }
}

// Error for insufficient allowance
export class InsufficientAllowanceError extends InitCapitalError {
  constructor(token: string, required: string, current: string) {
    super(`Insufficient ${token} allowance. Required: ${required}, Current: ${current}`);
    this.name = 'InsufficientAllowanceError';
  }
}

// Error for position not found
export class PositionNotFoundError extends InitCapitalError {
  constructor(posId: string) {
    super(`Position with ID ${posId} not found or does not belong to the wallet`);
    this.name = 'PositionNotFoundError';
  }
}

// Error for invalid mode
export class InvalidModeError extends InitCapitalError {
  constructor(mode: string) {
    super(`Invalid mode: ${mode}`);
    this.name = 'InvalidModeError';
  }
}

// Error for invalid token
export class InvalidTokenError extends InitCapitalError {
  constructor(token: string) {
    super(`Invalid token: ${token}`);
    this.name = 'InvalidTokenError';
  }
}

// Error for transaction failure
export class TransactionError extends InitCapitalError {
  constructor(tx: string, message: string) {
    super(`Transaction ${tx} failed: ${message}`);
    this.name = 'TransactionError';
  }
} 