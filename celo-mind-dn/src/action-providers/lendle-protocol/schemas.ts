import { z } from "zod";

// 📥 Schema for depositing MNT as collateral
export const DepositMNTSchema = z
  .object({
    amount: z.string().describe("The amount of MNT to deposit as collateral (in MNT units)"),
    onBehalfOf: z.string().optional().describe("Optional: The address that will own the deposited position. Default is caller's address"),
  })
  .strip();

// 📤 Schema for withdrawing MNT collateral
export const WithdrawMNTSchema = z
  .object({
    amount: z.string().describe("The amount of MNT to withdraw (in MNT units, use '-1' for maximum)"),
    onBehalfOf: z.string().optional().describe("Optional: The address that owns the position. Default is caller's address"),
  })
  .strip();

// 💼 Schema for getting user account data
export const GetUserAccountDataSchema = z
  .object({
    address: z.string().optional().describe("Optional: The address to check account data for. Default is the connected wallet"),
  })
  .strip();

// 📊 Schema for getting reserve data
export const GetReserveDataSchema = z
  .object({
    asset: z.string().optional().describe("Optional: The asset address to check reserve data for. Default is MNT"),
  })
  .strip();

// 👍 Schema for approving USDT for Lendle Protocol
export const ApproveUSDTSchema = z
  .object({
    amount: z.string().describe("The amount of USDT to approve (in USDT units, use '-1' for maximum)"),
  })
  .strip();

// 📥 Schema for depositing USDT as collateral
export const DepositUSDTSchema = z
  .object({
    amount: z.string().describe("The amount of USDT to deposit as collateral (in USDT units)"),
    onBehalfOf: z.string().optional().describe("Optional: The address that will own the deposited position. Default is caller's address"),
  })
  .strip(); 