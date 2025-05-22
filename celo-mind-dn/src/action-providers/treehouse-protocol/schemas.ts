import { z } from "zod";
import { TreehouseToken } from "./constants";

// 👍 Schema for token approval
export const ApproveTokenSchema = z
  .object({
    token: z.enum([TreehouseToken.CM_ETH])
      .describe("The token to approve for Treehouse staking"),
    amount: z.string().describe("The amount of tokens to approve (in token units)"),
  })
  .strip();

// 🥩 Schema for staking tokens
export const StakeTokensSchema = z
  .object({
    token: z.enum([TreehouseToken.CM_ETH])
      .describe("The token to stake in Treehouse Protocol"),
    amount: z.string().describe("The amount of tokens to stake (in token units)"),
    receiver: z.string().optional().describe("Optional: The address that will receive the staking benefits. Default is caller's address"),
  })
  .strip();

// 🚀 Schema for direct staking (combines approve+stake)
export const DirectStakeSchema = z
  .object({
    token: z.enum([TreehouseToken.CM_ETH])
      .describe("The token to stake in Treehouse Protocol"),
    amount: z.string().describe("The amount of tokens to stake (in token units)"),
    receiver: z.string().optional().describe("Optional: The address that will receive the staking benefits. Default is caller's address"),
  })
  .strip();

// 📤 Schema for withdrawing staked tokens
export const WithdrawStakedSchema = z
  .object({
    token: z.enum([TreehouseToken.CM_ETH])
      .describe("The token to withdraw from Treehouse Protocol"),
    amount: z.string().describe("The amount of tokens to withdraw (in token units, use '-1' for maximum)"),
    receiver: z.string().optional().describe("Optional: The address that will receive the withdrawn tokens. Default is caller's address"),
  })
  .strip();

// 💼 Schema for getting user staking data
export const GetUserStakingDataSchema = z
  .object({
    address: z.string().optional().describe("Optional: The address to check staking data for. Default is the connected wallet"),
  })
  .strip(); 