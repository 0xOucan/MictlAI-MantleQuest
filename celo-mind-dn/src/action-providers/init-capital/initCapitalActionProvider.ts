/**
 * INIT Capital Action Provider for Mantle Network
 * Implements functionality to interact with the INIT Capital protocol
 */

import { z } from "zod";
import { PublicClient, WalletClient, Account, createPublicClient, http, parseUnits, formatUnits, encodeFunctionData, zeroAddress, getAddress } from 'viem';
import {
  ActionProvider,
  EvmWalletProvider,
  CreateAction,
  Network
} from "@coinbase/agentkit";
import { createPendingTransaction } from '../../utils/transaction-utils';
import { createLogger } from '../../utils/logger';
import {
  INIT_CORE_ADDRESS,
  POS_MANAGER_ADDRESS,
  LENDING_POOL_ADDRESS,
  MONEY_MARKET_HOOK_ADDRESS,
  CHAIN,
  INIT_CORE_ABI,
  POS_MANAGER_ABI,
  ERC20_ABI,
  MONEY_MARKET_HOOK_ABI,
  USDT_ADDRESS,
  WETH_ADDRESS,
  WMNT_ADDRESS,
  WMNT_POOL_ADDRESS,
  TOKEN_ADDRESS_MAP,
  USDT_DECIMALS,
  WETH_DECIMALS,
  WMNT_DECIMALS,
  MNT_DECIMALS,
  DEFAULT_MODE,
  DEFAULT_VIEWER,
  MIN_HEALTH_E18,
  ACTION_NAMES
} from './constants';
import {
  InitCapitalError,
  PositionCreationError,
  CollateralAddError,
  CollateralRemoveError,
  BorrowError,
  RepayError,
  InsufficientCollateralError,
  InsufficientAllowanceError,
  PositionNotFoundError,
  InvalidModeError,
  InvalidTokenError,
  TransactionError
} from './errors';
import {
  CreatePositionSchema,
  CreatePositionParams,
  AddCollateralSchema,
  AddCollateralParams,
  RemoveCollateralSchema,
  RemoveCollateralParams,
  BorrowSchema,
  BorrowParams,
  RepaySchema,
  RepayParams,
  Position,
  PositionCollateral,
  PositionDebt,
  PositionResponse,
  TransactionResult,
  CreatePositionWithMntSchema,
  CreatePositionWithMntParams,
  AddMntCollateralSchema,
  AddMntCollateralParams,
  OperationParams,
  HookDepositParams,
  HookBorrowParams,
  HookWithdrawParams,
  HookRepayParams,
  RebaseHelperParams
} from './schemas';

// Initialize logger
const logger = createLogger('InitCapitalProvider');

/**
 * 🏦 InitCapitalActionProvider provides actions for interacting with INIT Capital protocol on Mantle
 */
export class InitCapitalActionProvider extends ActionProvider<EvmWalletProvider> {
  private publicClient: PublicClient;
  // Known valid checksummed addresses
  private validTokenAddresses: { [key: string]: `0x${string}` } = {
    'USDT': '0x201EBa5CC46D216Ce6DC03F6a759e8E766E956aE',
    'WETH': '0x51AB74f8B03F0305d8dcE936B473AB587911AEC4',
    'WMNT': '0x78c1b0c915c4faA5fFfa6cABF0219DA63D7F4CB8'
  };

  constructor() {
    super("init-capital", []);
    
    // Initialize the public client for Mantle network
    this.publicClient = createPublicClient({
      chain: CHAIN,
      transport: http()
    });
  }

  /**
   * 🌐 Check if we're on Mantle network
   */
  private async checkNetwork(walletProvider: EvmWalletProvider): Promise<void> {
    const network = await walletProvider.getNetwork();
    // Accept both network ID and chain ID checks for Mantle
    if ((!network.networkId || !network.networkId.includes("mantle")) && 
        (!network.chainId || network.chainId !== "5000")) {
      throw new Error("Wrong network. Please switch to Mantle.");
    }
  }

  /**
   * Get validated token address with proper checksum
   */
  private getValidatedTokenAddress(symbol: string): `0x${string}` {
    const upperSymbol = symbol.toUpperCase();
    
    if (this.validTokenAddresses[upperSymbol]) {
      return this.validTokenAddresses[upperSymbol];
    }
    
    throw new InvalidTokenError(symbol);
  }

  /**
   * Get token metadata by symbol
   */
  private getTokenMetadata(symbol: string): { address: `0x${string}`, decimals: number, isNative: boolean } {
    const upperSymbol = symbol.toUpperCase();
    
    if (upperSymbol === 'USDT') {
      return { address: this.getValidatedTokenAddress('USDT'), decimals: USDT_DECIMALS, isNative: false };
    } else if (upperSymbol === 'WETH') {
      return { address: this.getValidatedTokenAddress('WETH'), decimals: WETH_DECIMALS, isNative: false };
    } else if (upperSymbol === 'WMNT') {
      return { address: this.getValidatedTokenAddress('WMNT'), decimals: WMNT_DECIMALS, isNative: false };
    } else if (upperSymbol === 'MNT') {
      return { address: this.getValidatedTokenAddress('WMNT'), decimals: MNT_DECIMALS, isNative: true };
    }
    
    throw new InvalidTokenError(symbol);
  }

  /**
   * Check if the wallet has sufficient token allowance for the INIT Core contract
   */
  private async checkAllowance(
    walletProvider: EvmWalletProvider,
    tokenAddress: `0x${string}`,
    amount: string,
    decimals: number
  ): Promise<boolean> {
    try {
      const walletAddress = await walletProvider.getAddress();
      const amountInWei = parseUnits(amount, decimals);
      
      const allowance = await walletProvider.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletAddress as `0x${string}`, INIT_CORE_ADDRESS]
      }) as bigint;

      return allowance >= amountInWei;
    } catch (error) {
      logger.error('Error checking allowance', { error, tokenAddress, amount });
      throw error;
    }
  }

  /**
   * Check if the wallet has sufficient native MNT balance
   */
  private async checkNativeBalance(
    walletProvider: EvmWalletProvider,
    amount: string,
    extraForGas: string = '0.01' // Add 0.01 MNT for gas by default
  ): Promise<boolean> {
    try {
      const walletAddress = await walletProvider.getAddress();
      const amountInWei = parseUnits(amount, MNT_DECIMALS);
      const gasBuffer = parseUnits(extraForGas, MNT_DECIMALS);
      const totalNeeded = amountInWei + gasBuffer;
      
      // Get native balance
      const balance = await this.publicClient.getBalance({
        address: walletAddress as `0x${string}`
      });
      
      return balance >= totalNeeded;
    } catch (error) {
      logger.error('Error checking native balance', { error, amount });
      throw error;
    }
  }

  /**
   * Prepare an approval transaction for tokens
   */
  @CreateAction({
    name: "approve_init_token",
    description: "Approve tokens for use with INIT Capital protocol on Mantle",
    schema: z.object({
      symbol: z.string().describe("Token symbol (USDT, WETH, or WMNT)"),
      amount: z.string().describe("Amount of tokens to approve")
    })
  })
  async approveToken(
    walletProvider: EvmWalletProvider,
    args: { symbol: string, amount: string }
  ): Promise<string> {
    try {
      const walletAddress = await walletProvider.getAddress();
      const { address: tokenAddress, decimals, isNative } = this.getTokenMetadata(args.symbol);
      
      // Cannot approve native MNT, must use WMNT
      if (isNative) {
        throw new Error("Cannot approve native MNT. Use WMNT instead or use create_init_position_with_mnt to directly provide MNT.");
      }
      
      const amountInWei = parseUnits(args.amount, decimals);

      // Encode the approval function call
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [INIT_CORE_ADDRESS, amountInWei]
      });

      // Create a pending transaction
      const txId = createPendingTransaction(
        tokenAddress,
        '0',
        data,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created approval transaction for ${args.amount} ${args.symbol}`, { txId });
      return txId;
    } catch (error) {
      logger.error(`Error creating approval transaction for ${args.symbol}`, { error, amount: args.amount });
      throw error;
    }
  }

  /**
   * 🏦 Create a new position in INIT Capital
   */
  @CreateAction({
    name: "create_init_position",
    description: "Create a new position in INIT Capital lending protocol on Mantle",
    schema: CreatePositionSchema,
  })
  async createPosition(
    walletProvider: EvmWalletProvider,
    params: CreatePositionParams
  ): Promise<string> {
    // Ensure we're on the Mantle network
    await this.checkNetwork(walletProvider);

    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Validate params using zod schema
      const validParams = CreatePositionSchema.parse(params);
      
      // Use default viewer if not provided
      const viewer = validParams.viewer || DEFAULT_VIEWER;
      
      // Encode the createPos function call
      const data = encodeFunctionData({
        abi: INIT_CORE_ABI,
        functionName: 'createPos',
        args: [validParams.mode, viewer]
      });
      
      // Create a pending transaction
      const txId = createPendingTransaction(
        INIT_CORE_ADDRESS,
        '0',
        data,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created transaction to create position with mode ${validParams.mode}`, { txId });
      return txId;
    } catch (error) {
      logger.error('Error creating position', { error, params });
      throw new PositionCreationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * 🏦 Create a new position with MNT collateral using MoneyMarketHook
   */
  @CreateAction({
    name: "create_init_position_with_mnt",
    description: "Create a new position with MNT as collateral in INIT Capital on Mantle",
    schema: CreatePositionWithMntSchema,
  })
  async createPositionWithMnt(
    walletProvider: EvmWalletProvider,
    params: CreatePositionWithMntParams
  ): Promise<string> {
    // Ensure we're on the Mantle network
    await this.checkNetwork(walletProvider);

    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Validate params using zod schema
      const validParams = CreatePositionWithMntSchema.parse(params);
      
      // Always use the wallet address as the viewer for better compatibility
      const viewer = walletAddress as `0x${string}`;
      
      // Convert amount to wei
      const amountInWei = parseUnits(validParams.amount, MNT_DECIMALS);
      
      // Check if user has enough MNT balance (including gas)
      const hasBalance = await this.checkNativeBalance(walletProvider, validParams.amount);
      if (!hasBalance) {
        throw new Error(`Insufficient MNT balance. Make sure you have enough MNT for the deposit (${validParams.amount}) plus gas fees.`);
      }
      
      // Create MoneyMarketHook operation params
      const operationParams: OperationParams = {
        posId: 0, // 0 for new position
        viewer: viewer,
        mode: validParams.mode,
        depositParams: [
          {
            pool: WMNT_POOL_ADDRESS, // Use WMNT pool (native MNT will be wrapped)
            amt: amountInWei.toString(),
            rebaseHelperParams: {
              helper: '0x0000000000000000000000000000000000000000' as `0x${string}`,
              tokenIn: '0x0000000000000000000000000000000000000000' as `0x${string}`
            }
          }
        ],
        withdrawParams: [],
        borrowParams: [],
        repayParams: [],
        minHealth_e18: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // Use max value to prevent health check failures
        returnNative: validParams.returnNative
      };
      
      // Encode the execute function call
      const data = encodeFunctionData({
        abi: MONEY_MARKET_HOOK_ABI,
        functionName: 'execute',
        args: [operationParams]
      });
      
      // Create a pending transaction
      const txId = createPendingTransaction(
        MONEY_MARKET_HOOK_ADDRESS,
        amountInWei.toString(), // Send MNT value
        data,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created transaction to create position with ${validParams.amount} MNT as collateral`, { txId });
      return txId;
    } catch (error) {
      logger.error('Error creating position with MNT', { error, params });
      throw new PositionCreationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Add MNT collateral to a position using MoneyMarketHook
   */
  @CreateAction({
    name: "add_mnt_collateral",
    description: "Add MNT (native token) as collateral to an INIT Capital position on Mantle",
    schema: AddMntCollateralSchema,
  })
  async addMntCollateral(
    walletProvider: EvmWalletProvider,
    params: AddMntCollateralParams
  ): Promise<string> {
    // Ensure we're on the Mantle network
    await this.checkNetwork(walletProvider);

    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Validate params using zod schema
      const validParams = AddMntCollateralSchema.parse(params);
      
      // Convert amount to wei
      const amountInWei = parseUnits(validParams.amount, MNT_DECIMALS);
      
      // Check if user has enough MNT balance (including gas)
      const hasBalance = await this.checkNativeBalance(walletProvider, validParams.amount);
      if (!hasBalance) {
        throw new Error(`Insufficient MNT balance. Make sure you have enough MNT for the deposit (${validParams.amount}) plus gas fees.`);
      }
      
      // Create MoneyMarketHook operation params
      const operationParams: OperationParams = {
        posId: validParams.positionId,
        viewer: walletAddress as `0x${string}`,
        mode: DEFAULT_MODE,
        depositParams: [
          {
            pool: WMNT_POOL_ADDRESS, // Use WMNT pool (native MNT will be wrapped)
            amt: amountInWei.toString(),
            rebaseHelperParams: {
              helper: '0x0000000000000000000000000000000000000000' as `0x${string}`,
              tokenIn: '0x0000000000000000000000000000000000000000' as `0x${string}`
            }
          }
        ],
        withdrawParams: [],
        borrowParams: [],
        repayParams: [],
        minHealth_e18: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // Use max value to prevent health check failures
        returnNative: validParams.returnNative
      };
      
      // Encode the execute function call
      const data = encodeFunctionData({
        abi: MONEY_MARKET_HOOK_ABI,
        functionName: 'execute',
        args: [operationParams]
      });
      
      // Create a pending transaction
      const txId = createPendingTransaction(
        MONEY_MARKET_HOOK_ADDRESS,
        amountInWei.toString(), // Send MNT value
        data,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created transaction to add ${validParams.amount} MNT as collateral to position ${validParams.positionId}`, 
        { txId, positionId: validParams.positionId, amount: validParams.amount }
      );
      return txId;
    } catch (error) {
      logger.error('Error adding MNT collateral', { error, params });
      throw new CollateralAddError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Add collateral to a position
   */
  @CreateAction({
    name: "add_init_collateral",
    description: "Add collateral to an INIT Capital position on Mantle",
    schema: AddCollateralSchema,
  })
  async addCollateral(
    walletProvider: EvmWalletProvider,
    params: AddCollateralParams
  ): Promise<string> {
    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Validate params using zod schema
      const validParams = AddCollateralSchema.parse(params);
      
      // Get token metadata
      const { address: tokenAddress, decimals, isNative } = this.getTokenMetadata(validParams.token);
      
      // If this is native MNT, use the addMntCollateral method instead
      if (isNative) {
        return this.addMntCollateral(walletProvider, {
          positionId: validParams.positionId,
          amount: validParams.amount,
          returnNative: false
        });
      }
      
      // Convert amount to wei
      const amountInWei = parseUnits(validParams.amount, decimals);
      
      // Check if allowance is sufficient
      const hasAllowance = await this.checkAllowance(
        walletProvider,
        tokenAddress, 
        validParams.amount, 
        decimals
      );
      
      if (!hasAllowance) {
        throw new InsufficientAllowanceError(
          validParams.token, 
          validParams.amount, 
          '0'
        );
      }
      
      // Create a multicall with two operations:
      // 1. Transfer tokens to PosManager
      // 2. Collateralize the position
      
      // Step 1: Transfer tokens to PosManager
      const transferData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [POS_MANAGER_ADDRESS, amountInWei]
      });
      
      // Step 2: Collateralize the position
      const collateralizeData = encodeFunctionData({
        abi: INIT_CORE_ABI,
        functionName: 'collateralize',
        args: [BigInt(validParams.positionId), tokenAddress]
      });
      
      // Combine into multicall
      const multicallData = encodeFunctionData({
        abi: INIT_CORE_ABI,
        functionName: 'multicall',
        args: [[transferData, collateralizeData]]
      });
      
      // Create a pending transaction
      const txId = createPendingTransaction(
        INIT_CORE_ADDRESS,
        '0',
        multicallData,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created transaction to add ${validParams.amount} ${validParams.token} as collateral to position ${validParams.positionId}`, 
        { txId, positionId: validParams.positionId, token: validParams.token, amount: validParams.amount }
      );
      return txId;
    } catch (error) {
      logger.error('Error adding collateral', { error, params });
      throw new CollateralAddError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Remove collateral from a position
   */
  @CreateAction({
    name: "remove_init_collateral",
    description: "Remove collateral from an INIT Capital position on Mantle",
    schema: RemoveCollateralSchema,
  })
  async removeCollateral(
    walletProvider: EvmWalletProvider,
    params: RemoveCollateralParams
  ): Promise<string> {
    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Validate params using zod schema
      const validParams = RemoveCollateralSchema.parse(params);
      
      // Get token metadata
      const { address: tokenAddress, decimals, isNative } = this.getTokenMetadata(validParams.token);
      
      // Convert amount to shares (wei)
      const sharesInWei = parseUnits(validParams.amount, decimals);
      
      // Use wallet address as receiver if not provided
      const receiver = validParams.receiver || walletAddress;
      
      // For native MNT, we need to use the MoneyMarketHook with withdrawParams
      if (isNative) {
        // Create MoneyMarketHook operation params
        const operationParams: OperationParams = {
          posId: validParams.positionId,
          viewer: walletAddress as `0x${string}`,
          mode: DEFAULT_MODE,
          depositParams: [],
          withdrawParams: [
            {
              pool: WMNT_POOL_ADDRESS,
              shares: sharesInWei.toString(),
              rebaseHelperParams: {
                helper: '0x0000000000000000000000000000000000000000' as `0x${string}`,
                tokenIn: '0x0000000000000000000000000000000000000000' as `0x${string}`
              },
              to: receiver as `0x${string}`
            }
          ],
          borrowParams: [],
          repayParams: [],
          minHealth_e18: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // Use max value to prevent health check failures
          returnNative: true
        };
        
        // Encode the execute function call
        const data = encodeFunctionData({
          abi: MONEY_MARKET_HOOK_ABI,
          functionName: 'execute',
          args: [operationParams]
        });
        
        // Create a pending transaction
        const txId = createPendingTransaction(
          MONEY_MARKET_HOOK_ADDRESS,
          '0',
          data,
          walletAddress,
          { chain: 'mantle' }
        );
        
        logger.info(`Created transaction to remove ${validParams.amount} MNT collateral from position ${validParams.positionId}`, 
          { txId, positionId: validParams.positionId, token: validParams.token, amount: validParams.amount, receiver }
        );
        
        return txId;
      }
      
      // For non-native tokens, use the standard decollateralize function
      // Encode the decollateralize function call
      const data = encodeFunctionData({
        abi: INIT_CORE_ABI,
        functionName: 'decollateralize',
        args: [BigInt(validParams.positionId), tokenAddress, sharesInWei, receiver as `0x${string}`]
      });
      
      // Create a pending transaction
      const txId = createPendingTransaction(
        INIT_CORE_ADDRESS,
        '0',
        data,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created transaction to remove ${validParams.amount} ${validParams.token} collateral from position ${validParams.positionId}`, 
        { txId, positionId: validParams.positionId, token: validParams.token, amount: validParams.amount, receiver }
      );
      return txId;
    } catch (error) {
      logger.error('Error removing collateral', { error, params });
      throw new CollateralRemoveError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Borrow tokens using a position as collateral
   */
  @CreateAction({
    name: "borrow_from_init",
    description: "Borrow tokens using an INIT Capital position as collateral on Mantle",
    schema: BorrowSchema,
  })
  async borrow(
    walletProvider: EvmWalletProvider,
    params: BorrowParams
  ): Promise<string> {
    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Validate params using zod schema
      const validParams = BorrowSchema.parse(params);
      
      // Get token metadata
      const { address: tokenAddress, decimals, isNative } = this.getTokenMetadata(validParams.token);
      
      // Convert amount to wei
      const amountInWei = parseUnits(validParams.amount, decimals);
      
      // Use wallet address as receiver if not provided
      const receiver = validParams.receiver || walletAddress;
      
      // For native MNT borrowing, use MoneyMarketHook
      if (isNative) {
        // Create MoneyMarketHook operation params
        const operationParams: OperationParams = {
          posId: validParams.positionId,
          viewer: walletAddress as `0x${string}`,
          mode: DEFAULT_MODE,
          depositParams: [],
          withdrawParams: [],
          borrowParams: [
            {
              pool: WMNT_POOL_ADDRESS,
              amt: amountInWei.toString(),
              to: receiver as `0x${string}`
            }
          ],
          repayParams: [],
          minHealth_e18: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // Use max value to prevent health check failures
          returnNative: true
        };
        
        // Encode the execute function call
        const data = encodeFunctionData({
          abi: MONEY_MARKET_HOOK_ABI,
          functionName: 'execute',
          args: [operationParams]
        });
        
        // Create a pending transaction
        const txId = createPendingTransaction(
          MONEY_MARKET_HOOK_ADDRESS,
          '0',
          data,
          walletAddress,
          { chain: 'mantle' }
        );
        
        logger.info(`Created transaction to borrow ${validParams.amount} MNT from position ${validParams.positionId}`, 
          { txId, positionId: validParams.positionId, token: validParams.token, amount: validParams.amount, receiver }
        );
        
        return txId;
      }
      
      // For non-native tokens, use standard borrow function
      // Encode the borrow function call
      const data = encodeFunctionData({
        abi: INIT_CORE_ABI,
        functionName: 'borrow',
        args: [tokenAddress, amountInWei, BigInt(validParams.positionId), receiver as `0x${string}`]
      });
      
      // Create a pending transaction
      const txId = createPendingTransaction(
        INIT_CORE_ADDRESS,
        '0',
        data,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created transaction to borrow ${validParams.amount} ${validParams.token} from position ${validParams.positionId}`, 
        { txId, positionId: validParams.positionId, token: validParams.token, amount: validParams.amount, receiver }
      );
      return txId;
    } catch (error) {
      logger.error('Error borrowing', { error, params });
      throw new BorrowError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Repay borrowed tokens for a position
   */
  @CreateAction({
    name: "repay_init_debt",
    description: "Repay borrowed tokens for an INIT Capital position on Mantle",
    schema: RepaySchema,
  })
  async repay(
    walletProvider: EvmWalletProvider,
    params: RepayParams
  ): Promise<string> {
    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Validate params using zod schema
      const validParams = RepaySchema.parse(params);
      
      // Get token metadata
      const { address: tokenAddress, decimals, isNative } = this.getTokenMetadata(validParams.token);
      
      // Convert amount to debt shares (wei)
      const sharesInWei = parseUnits(validParams.amount, decimals);
      
      // For native MNT repayment, use MoneyMarketHook
      if (isNative) {
        // Check if user has enough MNT balance (including gas)
        const hasBalance = await this.checkNativeBalance(walletProvider, validParams.amount);
        if (!hasBalance) {
          throw new Error(`Insufficient MNT balance. Make sure you have enough MNT for the repayment (${validParams.amount}) plus gas fees.`);
        }
        
        // Create MoneyMarketHook operation params
        const operationParams: OperationParams = {
          posId: validParams.positionId,
          viewer: walletAddress as `0x${string}`,
          mode: DEFAULT_MODE,
          depositParams: [],
          withdrawParams: [],
          borrowParams: [],
          repayParams: [
            {
              pool: WMNT_POOL_ADDRESS,
              shares: sharesInWei.toString()
            }
          ],
          minHealth_e18: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // Use max value to prevent health check failures
          returnNative: false
        };
        
        // Encode the execute function call
        const data = encodeFunctionData({
          abi: MONEY_MARKET_HOOK_ABI,
          functionName: 'execute',
          args: [operationParams]
        });
        
        // Create a pending transaction
        const txId = createPendingTransaction(
          MONEY_MARKET_HOOK_ADDRESS,
          sharesInWei.toString(), // Send MNT value for repayment
          data,
          walletAddress,
          { chain: 'mantle' }
        );
        
        logger.info(`Created transaction to repay ${validParams.amount} MNT for position ${validParams.positionId}`, 
          { txId, positionId: validParams.positionId, token: validParams.token, amount: validParams.amount }
        );
        
        return txId;
      }
      
      // For other tokens, need to check allowance first
      // Check if allowance is sufficient
      const hasAllowance = await this.checkAllowance(
        walletProvider,
        tokenAddress,
        validParams.amount,
        decimals
      );
      
      if (!hasAllowance) {
        throw new InsufficientAllowanceError(
          validParams.token, 
          validParams.amount, 
          '0'
        );
      }
      
      // Encode the repay function call
      const data = encodeFunctionData({
        abi: INIT_CORE_ABI,
        functionName: 'repay',
        args: [tokenAddress, sharesInWei, BigInt(validParams.positionId)]
      });
      
      // Create a pending transaction
      const txId = createPendingTransaction(
        INIT_CORE_ADDRESS,
        '0',
        data,
        walletAddress,
        { chain: 'mantle' }
      );

      logger.info(`Created transaction to repay ${validParams.amount} ${validParams.token} for position ${validParams.positionId}`, 
        { txId, positionId: validParams.positionId, token: validParams.token, amount: validParams.amount }
      );
      return txId;
    } catch (error) {
      logger.error('Error repaying', { error, params });
      throw new RepayError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get position details
   */
  @CreateAction({
    name: "get_init_position",
    description: "Get details about an INIT Capital position on Mantle",
    schema: z.object({
      positionId: z.number().describe("ID of the position to query")
    })
  })
  async getPosition(
    walletProvider: EvmWalletProvider,
    args: { positionId: number }
  ): Promise<string> {
    try {
      const walletAddress = await walletProvider.getAddress();
      
      // Get basic position info
      const positionInfo = await this.publicClient.readContract({
        address: POS_MANAGER_ADDRESS,
        abi: POS_MANAGER_ABI,
        functionName: 'getPos',
        args: [BigInt(args.positionId)]
      }) as any;

      // Check if position exists and belongs to the wallet
      if (!positionInfo || 
          (positionInfo.owner.toLowerCase() !== walletAddress.toLowerCase())) {
        throw new PositionNotFoundError(args.positionId.toString());
      }

      // Initialize position response
      const position: PositionResponse = {
        id: args.positionId,
        owner: positionInfo.owner,
        mode: Number(positionInfo.mode),
        viewer: positionInfo.viewer,
        collaterals: [],
        debts: []
      };

      // Get collaterals for USDT, WETH, and WMNT
      for (const token of [USDT_ADDRESS, WETH_ADDRESS, WMNT_ADDRESS]) {
        let symbol, decimals;
        
        if (token === USDT_ADDRESS) {
          symbol = 'USDT';
          decimals = USDT_DECIMALS;
        } else if (token === WETH_ADDRESS) {
          symbol = 'WETH';
          decimals = WETH_DECIMALS;
        } else {
          symbol = 'MNT';  // Show as MNT instead of WMNT for better UX
          decimals = MNT_DECIMALS;
        }

        // Get collateral amount
        const collateralAmount = await this.publicClient.readContract({
          address: POS_MANAGER_ADDRESS,
          abi: POS_MANAGER_ABI,
          functionName: 'posCollaterals',
          args: [BigInt(args.positionId), token]
        }) as bigint;

        if (collateralAmount > 0n) {
          position.collaterals.push({
            positionId: args.positionId,
            token: symbol,
            tokenAddress: token,
            amount: formatUnits(collateralAmount, decimals)
          });
        }

        // Get debt amount
        const debtAmount = await this.publicClient.readContract({
          address: POS_MANAGER_ADDRESS,
          abi: POS_MANAGER_ABI,
          functionName: 'posBorrows',
          args: [BigInt(args.positionId), token]
        }) as bigint;

        if (debtAmount > 0n) {
          position.debts.push({
            positionId: args.positionId,
            token: symbol,
            tokenAddress: token,
            amount: formatUnits(debtAmount, decimals)
          });
        }
      }

      logger.info(`Retrieved position details for position ${args.positionId}`, { position });
      
      // Format a response message
      let responseMessage = `📊 **INIT Capital Position #${args.positionId}**\n\n`;
      responseMessage += `🔑 Owner: ${position.owner}\n`;
      responseMessage += `🔢 Mode: ${position.mode}\n\n`;
      
      if (position.collaterals.length > 0) {
        responseMessage += `💰 **Collateral**\n`;
        for (const collateral of position.collaterals) {
          responseMessage += `- ${collateral.amount} ${collateral.token}\n`;
        }
        responseMessage += `\n`;
      } else {
        responseMessage += `💰 **Collateral**: None\n\n`;
      }
      
      if (position.debts.length > 0) {
        responseMessage += `🔄 **Borrowed**\n`;
        for (const debt of position.debts) {
          responseMessage += `- ${debt.amount} ${debt.token}\n`;
        }
      } else {
        responseMessage += `🔄 **Borrowed**: None\n`;
      }
      
      return responseMessage;
    } catch (error) {
      logger.error('Error getting position details', { error, positionId: args.positionId });
      if (error instanceof PositionNotFoundError) {
        return `❌ Position #${args.positionId} not found or does not belong to your wallet.`;
      }
      return `❌ Error retrieving position: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * 🌐 Check if network is supported (returns true only for Mantle network)
   */
  supportsNetwork = (network: Network): boolean => {
    return network.networkId?.includes("mantle") || network.chainId === "5000";
  };
}

// Factory function to create the action provider instance
export const initCapitalActionProvider = () => new InitCapitalActionProvider();