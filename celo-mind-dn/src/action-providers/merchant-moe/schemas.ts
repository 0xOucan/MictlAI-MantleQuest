/**
 * Schema definitions for Merchant Moe action provider
 */
import { z } from "zod";
import { TOKENS } from "./constants";

// Schema for approving tokens for swapping
export const ApproveTokenSchema = z.object({
  token: z.string().refine((val) => {
    return Object.keys(TOKENS).includes(val) && !TOKENS[val as keyof typeof TOKENS].isNative;
  }, {
    message: "Token must be a valid non-native token (e.g., USDT)"
  }),
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Amount must be a valid positive number"
  }),
  // Optional infinite approval flag
  infinite: z.boolean().optional().default(false)
});

// Schema for swapping MNT to USDT
export const SwapMntToUsdtSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Amount must be a valid positive number"
  }),
  // Minimum amount of USDT to receive (optional, will calculate based on slippage if not provided)
  minAmountOut: z.string().optional(),
  // Optional slippage tolerance percentage (default is in constants)
  slippageTolerance: z.number().min(0.01).max(50).optional(),
  // Optional receiver address
  receiver: z.string().optional(),
  // Optional deadline in minutes
  deadlineMinutes: z.number().min(1).max(60).optional()
});

// Schema for swapping USDT to MNT
export const SwapUsdtToMntSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Amount must be a valid positive number"
  }),
  // Minimum amount of MNT to receive (optional, will calculate based on slippage if not provided)
  minAmountOut: z.string().optional(),
  // Optional slippage tolerance percentage
  slippageTolerance: z.number().min(0.01).max(50).optional(),
  // Optional receiver address
  receiver: z.string().optional(),
  // Optional deadline in minutes
  deadlineMinutes: z.number().min(1).max(60).optional()
});

// Type definitions for the schemas
export type ApproveTokenParams = z.infer<typeof ApproveTokenSchema>;
export type SwapMntToUsdtParams = z.infer<typeof SwapMntToUsdtSchema>;
export type SwapUsdtToMntParams = z.infer<typeof SwapUsdtToMntSchema>;

// Helper interface for swap results
export interface SwapResult {
  success: boolean;
  txHash?: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut?: string;
  error?: string;
} 