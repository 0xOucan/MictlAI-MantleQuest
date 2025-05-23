import { z } from "zod";

/**
 * Schema for Nebula chat requests
 * Allows natural language queries to be sent to Nebula AI
 */
export const NebulaChatSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long (max 2000 characters)")
    .describe("Natural language message to send to Nebula AI"),
    
  contextWalletAddress: z
    .string()
    .optional()
    .describe("Wallet address to provide context for the query"),
    
  includeTransactions: z
    .boolean()
    .default(true)
    .describe("Whether to include transaction preparation in the response"),
});

/**
 * Schema for Nebula execute requests
 * Executes transactions returned by Nebula
 */
export const NebulaExecuteSchema = z.object({
  sessionId: z
    .string()
    .min(1, "Session ID is required")
    .describe("Session ID from a previous chat response"),
    
  walletAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid Ethereum address")
    .describe("Wallet address to execute transactions from"),
    
  executeAll: z
    .boolean()
    .default(false)
    .describe("Whether to execute all transactions in the session"),
    
  transactionIndex: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Index of specific transaction to execute (if not executing all)"),
});

/**
 * Schema for querying blockchain data through Nebula
 */
export const NebulaQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Query cannot be empty")
    .max(1000, "Query is too long (max 1000 characters)")
    .describe("Natural language query about blockchain data"),
    
  targetAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid Ethereum address")
    .optional()
    .describe("Specific address to query data for"),
    
  tokenAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid Ethereum address")
    .optional()
    .describe("Specific token contract address to query"),
});

/**
 * Schema for Nebula reasoning requests
 * Ask Nebula to analyze and explain blockchain data or transactions
 */
export const NebulaReasonSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject cannot be empty")
    .max(1500, "Subject is too long (max 1500 characters)")
    .describe("What to analyze - transaction hash, contract address, or blockchain concept"),
    
  question: z
    .string()
    .min(1, "Question cannot be empty")
    .max(500, "Question is too long (max 500 characters)")
    .describe("Specific question about the subject"),
    
  includeRecommendations: z
    .boolean()
    .default(true)
    .describe("Whether to include actionable recommendations"),
});

/**
 * Schema for general Nebula AI assistance
 */
export const NebulaAssistSchema = z.object({
  request: z
    .string()
    .min(1, "Request cannot be empty")
    .max(2000, "Request is too long (max 2000 characters)")
    .describe("Natural language request for blockchain assistance"),
    
  userAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid Ethereum address")
    .optional()
    .describe("User's wallet address for personalized assistance"),
    
  priority: z
    .enum(["low", "normal", "high"])
    .default("normal")
    .describe("Priority level for the request"),
    
  expectTransactions: z
    .boolean()
    .default(false)
    .describe("Whether the request is expected to result in transactions"),
});

/**
 * Union type for all Nebula schemas
 */
export type NebulaChatInput = z.infer<typeof NebulaChatSchema>;
export type NebulaExecuteInput = z.infer<typeof NebulaExecuteSchema>;
export type NebulaQueryInput = z.infer<typeof NebulaQuerySchema>;
export type NebulaReasonInput = z.infer<typeof NebulaReasonSchema>;
export type NebulaAssistInput = z.infer<typeof NebulaAssistSchema>; 