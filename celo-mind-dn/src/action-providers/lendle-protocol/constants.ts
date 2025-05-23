/**
 * Constants for Lendle Protocol on Mantle network
 */
import { mantle } from "viem/chains";

export const ChainConstants = {
  // MNT is the native token on Mantle (like ETH on Ethereum)
  // No specific address needed as it's the native token
  MNT_IS_NATIVE: true, // Flag to indicate MNT is a native token
  
  // Token addresses
  USDT_TOKEN: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE", // USDT on Mantle
  
  // Contract addresses
  LENDLE_WETH_GATEWAY: "0xEc831f8710C6286a91a348928600157f07aC55c2",
  LENDLE_LENDING_POOL: "0xcfa5ae7c2ce8fadc6426c1ff872ca45378fb7cf3",
  
  // Chain configuration
  CHAIN: mantle,
  CHAIN_ID: 5000,
  CHAIN_NAME: "mantle"
};

/**
 * 🪙 Supported Lendle tokens
 */
export enum LendleToken {
  MNT = "MNT",
  USDT = "USDT",
}

/**
 * 🎨 Token icons
 */
export const TOKEN_ICONS: Record<string, string> = {
  MNT: '🔶',
  USDT: '💵',
};

/**
 * 📊 Token decimals
 */
export const TOKEN_DECIMALS: Record<string, number> = {
  MNT: 18,
  USDT: 6,
};

/**
 * 🔄 Lendle WETH Gateway ABI for depositETH function
 */
export const LENDLE_WETH_GATEWAY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "lendingPool", type: "address" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "lendingPool", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
];

/**
 * 🔄 Lendle Lending Pool ABI for relevant functions
 */
export const LENDLE_LENDING_POOL_ABI = [
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { internalType: "uint256", name: "totalCollateralETH", type: "uint256" },
      { internalType: "uint256", name: "totalDebtETH", type: "uint256" },
      { internalType: "uint256", name: "availableBorrowsETH", type: "uint256" },
      { internalType: "uint256", name: "currentLiquidationThreshold", type: "uint256" },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "healthFactor", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "configuration", type: "uint256" },
          { internalType: "uint128", name: "liquidityIndex", type: "uint128" },
          { internalType: "uint128", name: "variableBorrowIndex", type: "uint128" },
          { internalType: "uint128", name: "currentLiquidityRate", type: "uint128" },
          { internalType: "uint128", name: "currentVariableBorrowRate", type: "uint128" },
          { internalType: "uint128", name: "currentStableBorrowRate", type: "uint128" },
          { internalType: "uint40", name: "lastUpdateTimestamp", type: "uint40" },
          { internalType: "address", name: "aTokenAddress", type: "address" },
          { internalType: "address", name: "stableDebtTokenAddress", type: "address" },
          { internalType: "address", name: "variableDebtTokenAddress", type: "address" },
          { internalType: "address", name: "interestRateStrategyAddress", type: "address" },
          { internalType: "uint8", name: "id", type: "uint8" },
        ],
        internalType: "struct DataTypes.ReserveData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
];

/**
 * 🔄 ERC20 Token ABI for approval and other functions
 */
export const ERC20_TOKEN_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
]; 