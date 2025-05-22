/**
 * Network related constants used throughout the application
 */

// Network identifiers
export const CELO_NETWORK_ID = 'celo';
export const CELO_CHAIN_ID = '42220';
export const MANTLE_NETWORK_ID = 'mantle';
export const MANTLE_CHAIN_ID = '5000';
export const BASE_NETWORK_ID = 'base';
export const BASE_CHAIN_ID = '8453';
export const ARBITRUM_NETWORK_ID = 'arbitrum';
export const ARBITRUM_CHAIN_ID = '42161';
export const ZKSYNC_NETWORK_ID = 'zksync';
export const ZKSYNC_CHAIN_ID = '324';

// Gas multipliers
export const GAS_LIMIT_MULTIPLIER = 1.2;
export const FEE_PER_GAS_MULTIPLIER = 1.1;

// RPC configuration
export const RPC_RETRY_COUNT = 3;
export const RPC_RETRY_DELAY = 100; // ms
export const RPC_TIMEOUT = 30_000; // 30 seconds

// Explorer URLs
export const CELOSCAN_TX_URL = 'https://celoscan.io/tx/';
export const CELOSCAN_ADDRESS_URL = 'https://celoscan.io/address/';
export const MANTLESCAN_TX_URL = 'https://mantlescan.xyz/tx/';
export const MANTLESCAN_ADDRESS_URL = 'https://mantlescan.xyz/address/';
export const BASESCAN_TX_URL = 'https://basescan.org/tx/';
export const BASESCAN_ADDRESS_URL = 'https://basescan.org/address/';
export const ARBISCAN_TX_URL = 'https://arbiscan.io/tx/';
export const ARBISCAN_ADDRESS_URL = 'https://arbiscan.io/address/';
export const ZKSYNC_TX_URL = 'https://explorer.zksync.io/tx/';
export const ZKSYNC_ADDRESS_URL = 'https://explorer.zksync.io/address/';

// Transaction status
export const TX_STATUS = {
  PENDING: 'pending',
  SIGNED: 'signed',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const;

// Token prices fallback (when price feed is not available)
export const TOKEN_PRICES_USD = {
  CELO: 0.75,
  cUSD: 1.0,
  cEUR: 1.07,
  USDC: 1.0,
  MNT: 0.76,
  cmETH: 1826, // Same as ETH price
} as const; 