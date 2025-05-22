/**
 * Constants for Merchant Moe action provider on Mantle network
 */
import { getAddress } from 'viem';

// Chain information
export const MANTLE_CHAIN_ID = 5000;
export const MANTLE_NAME = 'Mantle';
export const MANTLE_EXPLORER_URL = 'https://mantlescan.xyz';

// Contract addresses with proper EIP-55 checksums
export const MERCHANT_MOE_ROUTER_ADDRESS = getAddress('0x45A62B090DF48243F12A21897e7ed91863E2c86b');
export const USDT_ADDRESS = getAddress('0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE');
export const WMNT_ADDRESS = getAddress('0x78c1b0c915c4faA5fFfa6cABF0219DA63D7F4CB8'); // Wrapped MNT token

// Route logic addresses with proper EIP-55 checksums
export const LOGIC_ROUTER_ADDRESS = getAddress('0xb35033d71cF5E13cAB5eB8618260F94363Dff9Cf'); // From MNT to USDT example
export const LOGIC_ROUTER_ADDRESS_ALT = getAddress('0xc04f291347d21dc663f7646056db22bff8ce8430'); // From USDT to MNT example

// Token decimals
export const MNT_DECIMALS = 18;
export const USDT_DECIMALS = 6;

// Common token addresses and info
export const TOKENS = {
  MNT: {
    symbol: 'MNT',
    name: 'Mantle',
    decimals: MNT_DECIMALS,
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Native token uses zero address
    isNative: true
  },
  WMNT: {
    symbol: 'WMNT',
    name: 'Wrapped Mantle',
    decimals: MNT_DECIMALS,
    address: WMNT_ADDRESS,
    isNative: false
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: USDT_DECIMALS,
    address: USDT_ADDRESS,
    isNative: false
  }
};

// The Router ABI (partial for swapping functions)
export const MERCHANT_MOE_ROUTER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "logic", "type": "address" },
      { "internalType": "address", "name": "tokenIn", "type": "address" },
      { "internalType": "address", "name": "tokenOut", "type": "address" },
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "bytes", "name": "route", "type": "bytes" }
    ],
    "name": "swapExactIn",
    "outputs": [
      { "internalType": "uint256", "name": "totalIn", "type": "uint256" },
      { "internalType": "uint256", "name": "totalOut", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WNATIVE",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Standard ERC20 ABI (subset for token operations)
export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Default route data for MNT to USDT swap (based on example transaction)
export const DEFAULT_MNT_TO_USDT_ROUTE = 
  '0x050078c1b0c915c4faa5fffa6cabf0219da63d7f4cb8371c7ec6d8039ff7933a' +
  '2aa28eb827ffe1f52f074515a45337f461a11ff0fe8abf3c606ae5dc00c9cda8' +
  '6a272531e8640cd7f1a92c01839911b90bb0201eba5cc46d216ce6dc03f6a759' +
  'e8e766e956aeebcf4786cd1a47fe6a8ca75af674add06c84f4b4138a03000001' +
  'a375ea3e1f92d62e3a71b668bab09f7155267fa3271001010003b670d2b452d0' +
  'ecc468cccfd532482d45dddde2a12710010101027d35ba038df5afde64a19626' +
  '83ffeb3e150637ff2710010002045c819961990c9f4f9fbfd4101f1d4e565b8a' +
  'a0a6271001000304000000000000000000000000000000000000000000000000';

// Default route data for USDT to MNT swap (based on example transaction)
export const DEFAULT_USDT_TO_MNT_ROUTE = 
  'd9f4e85489adcd0baf0cd63b4231c6af58c26745d9f4e85489adcd0baf0cd63b' +
  '4231c6af58c2674583bd37f90001201eba5cc46d216ce6dc03f6a759e8e766e9' +
  '56ae000178c1b0c915c4faa5fffa6cabf0219da63d7f4cb8030f42400812cbe3' +
  '3b5cb3e0000147ae0001227dfd9fa88bfe186682f3a45597bac051742e5f0000' +
  '0001c04f291347d21dc663f7646056db22bff8ce84303f40db9c030102030007' +
  '0101010201ff0000000000000000000000000000000000000000001da0925773' +
  'e15359c8b87272146e86444eb4faed201eba5cc46d216ce6dc03f6a759e8e766' +
  'e956ae0000000000000000000000000000000000000000000000000000000000';

// Slippage settings
export const DEFAULT_SLIPPAGE_PERCENTAGE = 0.5; // 0.5% slippage tolerance
export const DEFAULT_DEADLINE_MINUTES = 20; // 20 minutes deadline

// Action names
export const ACTION_NAMES = {
  SWAP_MNT_TO_USDT: 'swap_mnt_to_usdt',
  SWAP_USDT_TO_MNT: 'swap_usdt_to_mnt',
  APPROVE_TOKEN: 'approve_token_for_swap'
}; 