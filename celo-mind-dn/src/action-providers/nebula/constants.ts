/**
 * Constants for Nebula AI integration with thirdweb
 */
import { mantle } from "viem/chains";

export const NebulaConstants = {
  // API Configuration - Updated to match thirdweb documentation
  BASE_URL: "https://nebula-api.thirdweb.com",
  CHAT_ENDPOINT: "/chat",
  EXECUTE_ENDPOINT: "/execute",
  
  // Chain Configuration - Focus on Mantle network only
  SUPPORTED_CHAIN: mantle,
  CHAIN_ID: 5000,
  CHAIN_NAME: "mantle",
  
  // Request Configuration
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  
  // Context Filters - Limit to Mantle (updated format for thirdweb API)
  CONTEXT_FILTER: {
    chains: [{ id: 5000, name: "mantle" }],
  },
  
  // Response Configuration
  STREAM: false, // Disable streaming for action provider integration
  
  // Execute Config - for transaction execution
  EXECUTE_CONFIG: {
    mode: "client",
  },
};

/**
 * 🤖 Nebula capabilities
 */
export enum NebulaCapability {
  CHAT = "chat",
  EXECUTE = "execute",
  READ_DATA = "read_data",
  WRITE_TRANSACTION = "write_transaction",
  REASON = "reason",
}

/**
 * 🎨 Nebula icons
 */
export const NEBULA_ICONS: Record<string, string> = {
  CHAT: '🤖',
  EXECUTE: '⚡',
  READ: '📖',
  WRITE: '✍️',
  REASON: '🧠',
};

/**
 * 📊 Common blockchain actions that Nebula can help with
 */
export const NEBULA_ACTIONS = {
  BALANCE_QUERY: "Check token balances",
  TRANSFER_TOKENS: "Transfer tokens", 
  SWAP_TOKENS: "Swap tokens",
  CONTRACT_INTERACTION: "Interact with smart contracts",
  TRANSACTION_ANALYSIS: "Analyze transactions",
  MARKET_DATA: "Get market data",
  NFT_OPERATIONS: "NFT operations",
  DEFI_PROTOCOLS: "DeFi protocol interactions",
};

/**
 * 🔧 HTTP Headers for Nebula API
 */
export const NEBULA_HEADERS = {
  CONTENT_TYPE: "application/json",
  SECRET_KEY_HEADER: "x-secret-key",
};

/**
 * ⚠️ Error messages
 */
export const NEBULA_ERROR_MESSAGES = {
  MISSING_SECRET_KEY: "Thirdweb secret key is not configured",
  API_ERROR: "Nebula API error",
  NETWORK_ERROR: "Network error connecting to Nebula",
  INVALID_RESPONSE: "Invalid response from Nebula",
  EXECUTION_FAILED: "Failed to execute Nebula transaction",
  UNSUPPORTED_CHAIN: "Chain not supported by this Nebula integration",
}; 