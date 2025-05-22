/**
 * Constants for INIT Capital protocol on Mantle
 */

import { mantle } from 'viem/chains';

// Core contract addresses on Mantle network (from documentation)
export const INIT_CORE_ADDRESS = '0x972BcB0284cca0152527c4f70f8F689852bCAFc5' as `0x${string}`;
export const POS_MANAGER_ADDRESS = '0x0e7401707CD08c03CDb53DAEF3295DDFb68BBa92' as `0x${string}`;
export const LENDING_POOL_ADDRESS = '0x423bB7577BCf594df986D9646B44D3144b3329FD' as `0x${string}`;
export const MONEY_MARKET_HOOK_ADDRESS = '0xf82CBcAB75C1138a8F1F20179613e7C0C8337346' as `0x${string}`;

// Token addresses used in the protocol
export const USDT_ADDRESS = '0x201EBa5CC46D216Ce6DC03F6a759e8E766E956aE' as `0x${string}`; // USDT on Mantle
export const WMNT_ADDRESS = '0x78c1b0c915c4faA5fFfa6cABF0219DA63D7F4CB8' as `0x${string}`; // WMNT on Mantle
export const WETH_ADDRESS = '0x51AB74f8B03F0305d8dcE936B473AB587911AEC4' as `0x${string}`; // WETH on Mantle

// Pool addresses 
export const WMNT_POOL_ADDRESS = '0x44949636f778fAD2b139E665aee11a2dc84A2976' as `0x${string}`; // WMNT Pool on Mantle

// Token decimals
export const USDT_DECIMALS = 6;
export const MNT_DECIMALS = 18;
export const WMNT_DECIMALS = 18;
export const WETH_DECIMALS = 18;

// Chain info
export const CHAIN = mantle;
export const CHAIN_ID = CHAIN.id;
export const CHAIN_NAME = 'mantle';

// Protocol-specific constants
export const DEFAULT_MODE = 1; // Default Mode ID for position
export const DEFAULT_VIEWER = '0x0000000000000000000000000000000000000000' as `0x${string}`; // Default viewer address (zero address)
export const MIN_HEALTH_E18 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'; // Max value to prevent health check failures

// Action names for user-friendly responses
export const ACTION_NAMES = {
  CREATE_POSITION: 'Create INIT Capital Position',
  ADD_COLLATERAL: 'Add Collateral to INIT Position',
  BORROW: 'Borrow from INIT Position',
  REPAY: 'Repay INIT Position Debt',
  REMOVE_COLLATERAL: 'Remove Collateral from INIT Position'
};

// Map of token symbols to addresses
export const TOKEN_ADDRESS_MAP = {
  'USDT': USDT_ADDRESS,
  'WETH': WETH_ADDRESS,
  'WMNT': WMNT_POOL_ADDRESS,
  'MNT': WMNT_POOL_ADDRESS
};

// ABIs for the different contracts
export const INIT_CORE_ABI = [
  // createPos function
  {
    inputs: [
      { internalType: 'uint16', name: '_mode', type: 'uint16' },
      { internalType: 'address', name: '_viewer', type: 'address' }
    ],
    name: 'createPos',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // collateralize function
  {
    inputs: [
      { internalType: 'uint256', name: '_posId', type: 'uint256' },
      { internalType: 'address', name: '_inToken', type: 'address' }
    ],
    name: 'collateralize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // borrow function
  {
    inputs: [
      { internalType: 'address', name: '_underlyingToken', type: 'address' },
      { internalType: 'uint256', name: '_amt', type: 'uint256' },
      { internalType: 'uint256', name: '_posId', type: 'uint256' },
      { internalType: 'address', name: '_receiver', type: 'address' }
    ],
    name: 'borrow',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // repay function
  {
    inputs: [
      { internalType: 'address', name: '_underlyingToken', type: 'address' },
      { internalType: 'uint256', name: '_shares', type: 'uint256' },
      { internalType: 'uint256', name: '_posId', type: 'uint256' }
    ],
    name: 'repay',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // decollateralize function
  {
    inputs: [
      { internalType: 'uint256', name: '_posId', type: 'uint256' },
      { internalType: 'address', name: '_inToken', type: 'address' },
      { internalType: 'uint256', name: '_shares', type: 'uint256' },
      { internalType: 'address', name: '_receiver', type: 'address' }
    ],
    name: 'decollateralize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // multicall function for batched operations
  {
    inputs: [
      { internalType: 'bytes[]', name: 'data', type: 'bytes[]' }
    ],
    name: 'multicall',
    outputs: [
      { internalType: 'bytes[]', name: 'results', type: 'bytes[]' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export const POS_MANAGER_ABI = [
  // getPos function to get position details
  {
    inputs: [{ internalType: 'uint256', name: '_posId', type: 'uint256' }],
    name: 'getPos',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'uint16', name: 'mode', type: 'uint16' },
          { internalType: 'address', name: 'viewer', type: 'address' }
        ],
        internalType: 'struct IPosManager.PosInfo',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  // posCollaterals function to get position collaterals
  {
    inputs: [
      { internalType: 'uint256', name: '_posId', type: 'uint256' },
      { internalType: 'address', name: '_inToken', type: 'address' }
    ],
    name: 'posCollaterals',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // posBorrows function to get position borrows
  {
    inputs: [
      { internalType: 'uint256', name: '_posId', type: 'uint256' },
      { internalType: 'address', name: '_underlyingToken', type: 'address' }
    ],
    name: 'posBorrows',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export const ERC20_ABI = [
  // balanceOf function
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // approve function
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // allowance function
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // transfer function
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

// MoneyMarketHook ABI
export const MONEY_MARKET_HOOK_ABI = [
  // execute function to interact with the MoneyMarketHook
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'posId', type: 'uint256' },
          { internalType: 'address', name: 'viewer', type: 'address' },
          { internalType: 'uint16', name: 'mode', type: 'uint16' },
          { 
            components: [
              { internalType: 'address', name: 'pool', type: 'address' },
              { internalType: 'uint256', name: 'amt', type: 'uint256' },
              { 
                components: [
                  { internalType: 'address', name: 'helper', type: 'address' },
                  { internalType: 'address', name: 'tokenIn', type: 'address' }
                ],
                internalType: 'struct IMoneyMarketHook.RebaseHelperParams', 
                name: 'rebaseHelperParams', 
                type: 'tuple' 
              }
            ],
            internalType: 'struct IMoneyMarketHook.DepositParams[]', 
            name: 'depositParams', 
            type: 'tuple[]' 
          },
          { 
            components: [
              { internalType: 'address', name: 'pool', type: 'address' },
              { internalType: 'uint256', name: 'shares', type: 'uint256' },
              { 
                components: [
                  { internalType: 'address', name: 'helper', type: 'address' },
                  { internalType: 'address', name: 'tokenIn', type: 'address' }
                ],
                internalType: 'struct IMoneyMarketHook.RebaseHelperParams', 
                name: 'rebaseHelperParams', 
                type: 'tuple' 
              },
              { internalType: 'address', name: 'to', type: 'address' }
            ],
            internalType: 'struct IMoneyMarketHook.WithdrawParams[]', 
            name: 'withdrawParams', 
            type: 'tuple[]' 
          },
          { 
            components: [
              { internalType: 'address', name: 'pool', type: 'address' },
              { internalType: 'uint256', name: 'amt', type: 'uint256' },
              { internalType: 'address', name: 'to', type: 'address' }
            ],
            internalType: 'struct IMoneyMarketHook.BorrowParams[]', 
            name: 'borrowParams', 
            type: 'tuple[]' 
          },
          { 
            components: [
              { internalType: 'address', name: 'pool', type: 'address' },
              { internalType: 'uint256', name: 'shares', type: 'uint256' }
            ],
            internalType: 'struct IMoneyMarketHook.RepayParams[]', 
            name: 'repayParams', 
            type: 'tuple[]' 
          },
          { internalType: 'uint256', name: 'minHealth_e18', type: 'uint256' },
          { internalType: 'bool', name: 'returnNative', type: 'bool' }
        ],
        internalType: 'struct IMoneyMarketHook.OperationParams',
        name: '_params',
        type: 'tuple'
      }
    ],
    name: 'execute',
    outputs: [
      { internalType: 'uint256', name: 'posId', type: 'uint256' },
      { internalType: 'uint256', name: 'initPosId', type: 'uint256' },
      { internalType: 'bytes[]', name: 'results', type: 'bytes[]' }
    ],
    stateMutability: 'payable',
    type: 'function'
  }
]; 