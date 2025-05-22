/**
 * Error definitions for the Merchant Moe action provider
 */

export enum MerchantMoeErrors {
  WRONG_NETWORK = 'WRONG_NETWORK',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE = 'INSUFFICIENT_ALLOWANCE',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  PRICE_IMPACT_TOO_HIGH = 'PRICE_IMPACT_TOO_HIGH',
  DEADLINE_EXPIRED = 'DEADLINE_EXPIRED',
  SWAP_FAILED = 'SWAP_FAILED',
  APPROVAL_FAILED = 'APPROVAL_FAILED',
  INVALID_TOKEN = 'INVALID_TOKEN',
}

/**
 * Base error class for all Merchant Moe errors
 */
export class MerchantMoeError extends Error {
  code: MerchantMoeErrors;
  details?: any;

  constructor(code: MerchantMoeErrors, message: string, details?: any) {
    super(message);
    this.name = 'MerchantMoeError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, MerchantMoeError.prototype);
  }
}

/**
 * Thrown when the wallet is connected to the wrong network
 */
export class WrongNetworkError extends MerchantMoeError {
  constructor(currentNetwork: string | number, requiredNetwork: string) {
    super(
      MerchantMoeErrors.WRONG_NETWORK,
      `Wrong network detected. Currently on ${currentNetwork}, but ${requiredNetwork} is required.`,
      { currentNetwork, requiredNetwork }
    );
    Object.setPrototypeOf(this, WrongNetworkError.prototype);
  }
}

/**
 * Thrown when the wallet has insufficient balance
 */
export class InsufficientBalanceError extends MerchantMoeError {
  constructor(balance: string, requiredAmount: string, tokenSymbol: string) {
    super(
      MerchantMoeErrors.INSUFFICIENT_BALANCE,
      `Insufficient balance. You have ${balance} ${tokenSymbol}, but ${requiredAmount} ${tokenSymbol} is required.`,
      { balance, requiredAmount, tokenSymbol }
    );
    Object.setPrototypeOf(this, InsufficientBalanceError.prototype);
  }
}

/**
 * Thrown when there's insufficient allowance for token swaps
 */
export class InsufficientAllowanceError extends MerchantMoeError {
  constructor(allowance: string, requiredAmount: string, tokenSymbol: string) {
    super(
      MerchantMoeErrors.INSUFFICIENT_ALLOWANCE,
      `Insufficient allowance for ${tokenSymbol}. Current allowance: ${allowance}, required: ${requiredAmount}. Please approve the token first.`,
      { allowance, requiredAmount, tokenSymbol }
    );
    Object.setPrototypeOf(this, InsufficientAllowanceError.prototype);
  }
}

/**
 * Thrown when the swap amount is invalid
 */
export class InvalidAmountError extends MerchantMoeError {
  constructor(amount: string, minAmount: string, maxAmount: string, tokenSymbol: string) {
    super(
      MerchantMoeErrors.INVALID_AMOUNT,
      `Invalid amount. Amount must be between ${minAmount} and ${maxAmount} ${tokenSymbol}.`,
      { amount, minAmount, maxAmount, tokenSymbol }
    );
    Object.setPrototypeOf(this, InvalidAmountError.prototype);
  }
}

/**
 * Thrown when a transaction fails
 */
export class TransactionFailedError extends MerchantMoeError {
  constructor(txHash?: string, details?: string) {
    super(
      MerchantMoeErrors.TRANSACTION_FAILED,
      `Transaction failed${details ? `: ${details}` : '.'}`,
      { txHash, details }
    );
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}

/**
 * Thrown when the price impact is too high
 */
export class PriceImpactTooHighError extends MerchantMoeError {
  constructor(priceImpact: string, maxImpact: string) {
    super(
      MerchantMoeErrors.PRICE_IMPACT_TOO_HIGH,
      `Price impact too high. Expected impact: ${priceImpact}%, maximum allowed: ${maxImpact}%.`,
      { priceImpact, maxImpact }
    );
    Object.setPrototypeOf(this, PriceImpactTooHighError.prototype);
  }
}

/**
 * Thrown when the swap deadline has expired
 */
export class DeadlineExpiredError extends MerchantMoeError {
  constructor(deadline: number, currentTime: number) {
    super(
      MerchantMoeErrors.DEADLINE_EXPIRED,
      `Swap deadline expired. Current time: ${new Date(currentTime).toISOString()}, deadline: ${new Date(deadline).toISOString()}.`,
      { deadline, currentTime }
    );
    Object.setPrototypeOf(this, DeadlineExpiredError.prototype);
  }
}

/**
 * Thrown when a swap operation fails
 */
export class SwapFailedError extends MerchantMoeError {
  constructor(tokenIn: string, tokenOut: string, amount: string, details?: string) {
    super(
      MerchantMoeErrors.SWAP_FAILED,
      `Failed to swap ${amount} ${tokenIn} to ${tokenOut}${details ? `: ${details}` : '.'}`,
      { tokenIn, tokenOut, amount, details }
    );
    Object.setPrototypeOf(this, SwapFailedError.prototype);
  }
}

/**
 * Thrown when token approval fails
 */
export class ApprovalFailedError extends MerchantMoeError {
  constructor(token: string, spender: string, details?: string) {
    super(
      MerchantMoeErrors.APPROVAL_FAILED,
      `Failed to approve ${token} for spender ${spender}${details ? `: ${details}` : '.'}`,
      { token, spender, details }
    );
    Object.setPrototypeOf(this, ApprovalFailedError.prototype);
  }
}

/**
 * Thrown when an invalid token is specified
 */
export class InvalidTokenError extends MerchantMoeError {
  constructor(token: string, validTokens: string[]) {
    super(
      MerchantMoeErrors.INVALID_TOKEN,
      `Invalid token: ${token}. Valid tokens are: ${validTokens.join(', ')}.`,
      { token, validTokens }
    );
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
} 