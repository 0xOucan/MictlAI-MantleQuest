/**
 * Zod schemas for INIT Capital operations
 */

import { z } from 'zod';
import { TOKEN_ADDRESS_MAP, MIN_HEALTH_E18 } from './constants';

// Schema for position creation
export const CreatePositionSchema = z.object({
  mode: z.number().int().min(1).default(1),
  viewer: z.string().optional()
});

export type CreatePositionParams = z.infer<typeof CreatePositionSchema>;

// Schema for adding collateral
export const AddCollateralSchema = z.object({
  positionId: z.number().int().min(1),
  token: z.string().refine(
    (val) => Object.keys(TOKEN_ADDRESS_MAP).includes(val.toUpperCase()),
    { message: "Token not supported. Supported tokens: " + Object.keys(TOKEN_ADDRESS_MAP).join(', ') }
  ),
  amount: z.string().min(1)
});

export type AddCollateralParams = z.infer<typeof AddCollateralSchema>;

// Schema for removing collateral
export const RemoveCollateralSchema = z.object({
  positionId: z.number().int().min(1),
  token: z.string().refine(
    (val) => Object.keys(TOKEN_ADDRESS_MAP).includes(val.toUpperCase()),
    { message: "Token not supported. Supported tokens: " + Object.keys(TOKEN_ADDRESS_MAP).join(', ') }
  ),
  amount: z.string().min(1),
  receiver: z.string().optional()
});

export type RemoveCollateralParams = z.infer<typeof RemoveCollateralSchema>;

// Schema for borrowing
export const BorrowSchema = z.object({
  positionId: z.number().int().min(1),
  token: z.string().refine(
    (val) => Object.keys(TOKEN_ADDRESS_MAP).includes(val.toUpperCase()),
    { message: "Token not supported. Supported tokens: " + Object.keys(TOKEN_ADDRESS_MAP).join(', ') }
  ),
  amount: z.string().min(1),
  receiver: z.string().optional()
});

export type BorrowParams = z.infer<typeof BorrowSchema>;

// Schema for repaying
export const RepaySchema = z.object({
  positionId: z.number().int().min(1),
  token: z.string().refine(
    (val) => Object.keys(TOKEN_ADDRESS_MAP).includes(val.toUpperCase()),
    { message: "Token not supported. Supported tokens: " + Object.keys(TOKEN_ADDRESS_MAP).join(', ') }
  ),
  amount: z.string().min(1)
});

export type RepayParams = z.infer<typeof RepaySchema>;

// Schema for creating position with MNT as collateral
export const CreatePositionWithMntSchema = z.object({
  mode: z.number().int().min(1).default(1),
  viewer: z.string().optional(),
  amount: z.string().min(1),
  returnNative: z.boolean().default(false)
});

export type CreatePositionWithMntParams = z.infer<typeof CreatePositionWithMntSchema>;

// Schema for adding MNT as collateral
export const AddMntCollateralSchema = z.object({
  positionId: z.number().int().min(1),
  amount: z.string().min(1),
  returnNative: z.boolean().default(false)
});

export type AddMntCollateralParams = z.infer<typeof AddMntCollateralSchema>;

// MoneyMarketHook interfaces
export interface RebaseHelperParams {
  helper: `0x${string}`; // Rebase helper address (0x0 if not used)
  tokenIn: `0x${string}`; // Token to use in rebase helper
}

export interface HookDepositParams {
  pool: `0x${string}`; // Lending pool address to deposit
  amt: string; // Amount to deposit
  rebaseHelperParams: RebaseHelperParams; // Rebase helper params
}

export interface HookWithdrawParams {
  pool: `0x${string}`; // Lending pool to withdraw from
  shares: string; // Shares to withdraw
  rebaseHelperParams: RebaseHelperParams; // Rebase helper params
  to: `0x${string}`; // Receiver address
}

export interface HookBorrowParams {
  pool: `0x${string}`; // Lending pool to borrow from
  amt: string; // Amount to borrow
  to: `0x${string}`; // Receiver address
}

export interface HookRepayParams {
  pool: `0x${string}`; // Lending pool to repay
  shares: string; // Shares to repay
}

export interface OperationParams {
  posId: number; // Position ID (0 to create new)
  viewer: `0x${string}`; // Viewer address
  mode: number; // Position mode
  depositParams: HookDepositParams[]; // Deposit parameters
  withdrawParams: HookWithdrawParams[]; // Withdraw parameters
  borrowParams: HookBorrowParams[]; // Borrow parameters
  repayParams: HookRepayParams[]; // Repay parameters
  minHealth_e18: string; // Minimum health to maintain after execution
  returnNative: boolean; // Return native token or wrapped token
}

// Result types
export interface Position {
  id: number;
  owner: string;
  mode: number;
  viewer: string;
}

export interface PositionCollateral {
  positionId: number;
  token: string;
  tokenAddress: string;
  amount: string;
}

export interface PositionDebt {
  positionId: number;
  token: string;
  tokenAddress: string;
  amount: string;
}

export interface PositionResponse {
  id: number;
  owner: string;
  mode: number;
  viewer: string;
  collaterals: PositionCollateral[];
  debts: PositionDebt[];
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
} 