import { z } from "zod";
import {
  ActionProvider,
  Network,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import {
  PublicClient,
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
  encodeFunctionData,
  getAddress,
  isAddress
} from 'viem';
import { mantle } from 'viem/chains';
import "reflect-metadata";
import { createPendingTransaction } from '../../utils/transaction-utils';

import {
  MERCHANT_MOE_ROUTER_ADDRESS,
  MERCHANT_MOE_ROUTER_ABI,
  ERC20_ABI,
  TOKENS,
  MANTLE_CHAIN_ID,
  MANTLE_NAME,
  MANTLE_EXPLORER_URL,
  LOGIC_ROUTER_ADDRESS,
  LOGIC_ROUTER_ADDRESS_ALT,
  DEFAULT_MNT_TO_USDT_ROUTE,
  DEFAULT_USDT_TO_MNT_ROUTE,
  DEFAULT_SLIPPAGE_PERCENTAGE,
  DEFAULT_DEADLINE_MINUTES,
  ACTION_NAMES
} from "./constants";

import {
  WrongNetworkError,
  InsufficientBalanceError,
  InsufficientAllowanceError,
  InvalidAmountError,
  TransactionFailedError,
  SwapFailedError,
  ApprovalFailedError,
  InvalidTokenError
} from "./errors";

import {
  ApproveTokenSchema,
  ApproveTokenParams,
  SwapMntToUsdtSchema,
  SwapMntToUsdtParams,
  SwapUsdtToMntSchema,
  SwapUsdtToMntParams,
  SwapResult
} from "./schemas";

/**
 * MerchantMoeActionProvider provides actions for swapping MNT and other tokens
 * on the Mantle network using the Merchant Moe protocol.
 */
export class MerchantMoeActionProvider extends ActionProvider<EvmWalletProvider> {
  private publicClient: PublicClient;

  constructor() {
    super("merchant-moe", []);
    
    // Initialize the public client for Mantle network
    this.publicClient = createPublicClient({
      chain: mantle,
      transport: http()
    });
  }

  /**
   * Check if the wallet is connected to the Mantle network
   */
  private async checkNetwork(walletProvider: EvmWalletProvider): Promise<void> {
    const network = await walletProvider.getNetwork();
    const chainId = network.chainId;

    if (chainId !== MANTLE_CHAIN_ID.toString()) {
      throw new WrongNetworkError(chainId || 'unknown', MANTLE_NAME);
    }
  }

  /**
   * Get the MNT (native token) balance for a wallet
   */
  private async getNativeBalance(walletAddress: string): Promise<bigint> {
    try {
      return await this.publicClient.getBalance({ 
        address: walletAddress as `0x${string}`
      });
    } catch (error) {
      console.error(`Error getting native balance:`, error);
      return BigInt(0);
    }
  }

  /**
   * Get the token balance for a wallet
   */
  private async getTokenBalance(
    tokenAddress: `0x${string}`,
    walletAddress: string
  ): Promise<bigint> {
    try {
      return await this.publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      }) as bigint;
    } catch (error) {
      console.error(`Error getting token balance:`, error);
      return BigInt(0);
    }
  }

  /**
   * Get the token allowance for the router
   */
  private async getTokenAllowance(
    tokenAddress: `0x${string}`,
    ownerAddress: string,
    spenderAddress: `0x${string}` = MERCHANT_MOE_ROUTER_ADDRESS as `0x${string}`
  ): Promise<bigint> {
    try {
      return await this.publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [ownerAddress as `0x${string}`, spenderAddress],
      }) as bigint;
    } catch (error) {
      console.error(`Error getting token allowance:`, error);
      return BigInt(0);
    }
  }

  /**
   * Calculate minimum amount out based on amount in and slippage tolerance
   */
  private calculateMinAmountOut(
    amountIn: string,
    decimalsIn: number,
    decimalsOut: number,
    slippageTolerance: number = DEFAULT_SLIPPAGE_PERCENTAGE
  ): string {
    // This is a simplified calculation and should be replaced with actual price quotes
    // from the protocol or an oracle in a real implementation
    
    // For MNT to USDT, roughly 1 MNT = 0.75 USDT (based on current market price)
    // Adjust this formula based on actual pricing data
    const amountInValue = parseFloat(amountIn);
    let expectedAmountOut: number;
    
    if (decimalsIn === TOKENS.MNT.decimals && decimalsOut === TOKENS.USDT.decimals) {
      // MNT to USDT
      expectedAmountOut = amountInValue * 0.75;
    } else if (decimalsIn === TOKENS.USDT.decimals && decimalsOut === TOKENS.MNT.decimals) {
      // USDT to MNT
      expectedAmountOut = amountInValue / 0.75;
    } else {
      expectedAmountOut = amountInValue; // 1:1 as fallback
    }
    
    // Apply slippage tolerance
    const minAmountOut = expectedAmountOut * (1 - slippageTolerance / 100);
    
    // Convert to wei with appropriate decimals
    return minAmountOut.toFixed(decimalsOut).toString();
  }

  /**
   * Calculate deadline timestamp in seconds
   */
  private calculateDeadline(minutes: number = DEFAULT_DEADLINE_MINUTES): bigint {
    const now = Math.floor(Date.now() / 1000);
    return BigInt(now + minutes * 60);
  }

  /**
   * Format explorer link for a transaction
   */
  private getExplorerLink(txHash: string): string {
    return `${MANTLE_EXPLORER_URL}/tx/${txHash}`;
  }

  /**
   * Ensure an address is valid and in checksummed format
   */
  private ensureChecksumAddress(address: string): `0x${string}` {
    if (!isAddress(address)) {
      throw new Error(`Invalid address format: ${address}`);
    }
    return getAddress(address) as `0x${string}`;
  }

  /**
   * Approve token for swapping
   */
  @CreateAction({
    name: ACTION_NAMES.APPROVE_TOKEN,
    description: "Approve a token for swapping on Merchant Moe",
    schema: ApproveTokenSchema,
  })
  async approveToken(
    walletProvider: EvmWalletProvider,
    params: ApproveTokenParams
  ): Promise<string> {
    try {
      // Check network
      await this.checkNetwork(walletProvider);

      // Validate token
      if (!Object.keys(TOKENS).includes(params.token)) {
        throw new InvalidTokenError(params.token, Object.keys(TOKENS));
      }

      // Only non-native tokens need approval
      const tokenInfo = TOKENS[params.token as keyof typeof TOKENS];
      if (tokenInfo.isNative) {
        return `✅ No approval needed for native ${params.token} token.`;
      }

      const walletAddress = await walletProvider.getAddress();
      const tokenAddress = tokenInfo.address;
      
      // Determine approval amount
      const amount = params.infinite 
        ? BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff") // Max uint256 for infinite approval
        : parseUnits(params.amount, tokenInfo.decimals);

      // Check current allowance
      const currentAllowance = await this.getTokenAllowance(
        tokenAddress as `0x${string}`,
        walletAddress,
        MERCHANT_MOE_ROUTER_ADDRESS as `0x${string}`
      );

      console.log(`Current ${params.token} allowance: ${formatUnits(currentAllowance, tokenInfo.decimals)}`);
      console.log(`Required allowance: ${params.infinite ? 'unlimited' : params.amount}`);

      // Skip if allowance is already sufficient
      if (currentAllowance >= amount && !params.infinite) {
        return `✅ Token ${params.token} already has sufficient allowance (${formatUnits(currentAllowance, tokenInfo.decimals)} ${params.token}).`;
      }

      // Create encoded data for approval
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MERCHANT_MOE_ROUTER_ADDRESS, amount],
      });

      console.log(`Approving ${params.infinite ? 'unlimited' : params.amount} ${params.token} for Merchant Moe Router`);
      console.log(`Token address: ${tokenAddress}`);
      console.log(`Router address: ${MERCHANT_MOE_ROUTER_ADDRESS}`);
      
      // For debugging purposes, log the transaction details
      console.log('Approval transaction details:', {
        to: tokenAddress,
        value: "0", // No native value for token approval
        data: data.substring(0, 66) + "...", // Truncate data for logging
        walletAddress: walletAddress
      });

      // Send the approval transaction using createPendingTransaction utility
      const txHash = await createPendingTransaction(
        tokenAddress,
        "0", // No native value for token approval
        data,
        walletAddress,
        { chain: 'mantle' } // Explicitly specify the chain
      );

      return `✅ Successfully initiated approval of ${params.infinite ? 'unlimited' : params.amount} ${params.token} for swapping. Transaction ID: ${txHash}`;
    } catch (error) {
      console.error(`Error approving token:`, error);
      if (error instanceof WrongNetworkError ||
          error instanceof InvalidTokenError) {
        return `❌ ${error.message}`;
      } else if (error instanceof Error) {
        return `❌ Error approving token: ${error.message}`;
      }
      return `❌ An unknown error occurred while approving token.`;
    }
  }

  /**
   * Swap MNT to USDT
   */
  @CreateAction({
    name: ACTION_NAMES.SWAP_MNT_TO_USDT,
    description: "Swap MNT to USDT on Merchant Moe",
    schema: SwapMntToUsdtSchema,
  })
  async swapMntToUsdt(
    walletProvider: EvmWalletProvider,
    params: SwapMntToUsdtParams
  ): Promise<string> {
    try {
      // Check network
      await this.checkNetwork(walletProvider);
      
      const walletAddress = await walletProvider.getAddress();
      
      // Get source token info
      const sourceToken = TOKENS.MNT;
      const targetToken = TOKENS.USDT;
      
      // Convert amount to wei
      const amountInWei = parseUnits(params.amount, sourceToken.decimals);
      
      // Check user's MNT balance
      const mntBalance = await this.getNativeBalance(walletAddress);
      if (mntBalance < amountInWei) {
        throw new InsufficientBalanceError(
          formatUnits(mntBalance, sourceToken.decimals),
          params.amount,
          sourceToken.symbol
        );
      }
      
      // Calculate minimum amount to receive
      const minAmountOut = params.minAmountOut || 
        this.calculateMinAmountOut(
          params.amount, 
          sourceToken.decimals, 
          targetToken.decimals, 
          params.slippageTolerance
        );
      
      const minAmountOutWei = parseUnits(minAmountOut, targetToken.decimals);
      
      // Calculate deadline
      const deadline = this.calculateDeadline(params.deadlineMinutes);
      
      // Create transaction parameters
      const receiverAddress = params.receiver ? this.ensureChecksumAddress(params.receiver) : this.ensureChecksumAddress(walletAddress);
      
      // Arguments for swapExactIn function
      const swapArgs = {
        logic: LOGIC_ROUTER_ADDRESS,
        tokenIn: sourceToken.address, // For native token, use zero address
        tokenOut: targetToken.address,
        amountIn: amountInWei,
        amountOutMin: minAmountOutWei,
        to: receiverAddress,
        deadline,
        route: DEFAULT_MNT_TO_USDT_ROUTE as `0x${string}`
      };
      
      // Create encoded transaction data
      const data = encodeFunctionData({
        abi: MERCHANT_MOE_ROUTER_ABI,
        functionName: "swapExactIn",
        args: [
          swapArgs.logic,
          swapArgs.tokenIn,
          swapArgs.tokenOut,
          swapArgs.amountIn,
          swapArgs.amountOutMin,
          swapArgs.to,
          swapArgs.deadline,
          swapArgs.route
        ]
      });
      
      console.log(`Swapping ${params.amount} MNT to USDT with min out: ${minAmountOut} USDT`);
      console.log(`Native value being sent: ${amountInWei.toString()} wei`);
      
      // For debugging purposes, log the transaction details
      console.log('Transaction details:', {
        to: MERCHANT_MOE_ROUTER_ADDRESS,
        value: amountInWei.toString(),
        data: data,
        walletAddress: walletAddress
      });
      
      // For native MNT swaps, we must explicitly pass the value
      const txHash = await createPendingTransaction(
        MERCHANT_MOE_ROUTER_ADDRESS,
        amountInWei.toString(), // Convert BigInt to string to avoid serialization issues
        data,
        walletAddress,
        { chain: 'mantle' } // Explicitly specify the chain
      );
      
      // Return success message with transaction details
      return `✅ Successfully initiated swap of ${params.amount} MNT to at least ${minAmountOut} USDT. Transaction ID: ${txHash}`;
    } catch (error) {
      console.error(`Error swapping MNT to USDT:`, error);
      if (error instanceof WrongNetworkError ||
          error instanceof InsufficientBalanceError) {
        return `❌ ${error.message}`;
      } else if (error instanceof Error) {
        return `❌ Error swapping MNT to USDT: ${error.message}`;
      }
      return `❌ An unknown error occurred while swapping MNT to USDT.`;
    }
  }

  /**
   * Swap USDT to MNT
   */
  @CreateAction({
    name: ACTION_NAMES.SWAP_USDT_TO_MNT,
    description: "Swap USDT to MNT on Merchant Moe",
    schema: SwapUsdtToMntSchema,
  })
  async swapUsdtToMnt(
    walletProvider: EvmWalletProvider,
    params: SwapUsdtToMntParams
  ): Promise<string> {
    try {
      // Check network
      await this.checkNetwork(walletProvider);
      
      const walletAddress = await walletProvider.getAddress();
      
      // Get source token info
      const sourceToken = TOKENS.USDT;
      const targetToken = TOKENS.MNT;
      
      // Convert amount to wei
      const amountInWei = parseUnits(params.amount, sourceToken.decimals);
      
      // Check user's USDT balance
      const usdtBalance = await this.getTokenBalance(
        sourceToken.address as `0x${string}`,
        walletAddress
      );
      
      if (usdtBalance < amountInWei) {
        throw new InsufficientBalanceError(
          formatUnits(usdtBalance, sourceToken.decimals),
          params.amount,
          sourceToken.symbol
        );
      }
      
      // Always do a fresh check for token allowance using publicClient instead of walletProvider
      // This ensures we get the latest state from the blockchain
      let usdtAllowance;
      try {
        usdtAllowance = await this.publicClient.readContract({
          address: sourceToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [walletAddress as `0x${string}`, MERCHANT_MOE_ROUTER_ADDRESS as `0x${string}`],
        }) as bigint;
        
        console.log(`Current USDT allowance for ${walletAddress}: ${formatUnits(usdtAllowance, sourceToken.decimals)} USDT`);
      } catch (error) {
        console.error(`Error checking USDT allowance:`, error);
        usdtAllowance = BigInt(0);
      }
      
      if (usdtAllowance < amountInWei) {
        // If allowance is insufficient, suggest approving first
        const message = `Insufficient USDT allowance. Current: ${formatUnits(usdtAllowance, sourceToken.decimals)}, Required: ${params.amount}. Please approve USDT first using the approve_token action.`;
        console.error(message);
        throw new InsufficientAllowanceError(
          formatUnits(usdtAllowance, sourceToken.decimals),
          params.amount,
          sourceToken.symbol
        );
      }
      
      // Calculate minimum amount to receive
      const minAmountOut = params.minAmountOut || 
        this.calculateMinAmountOut(
          params.amount, 
          sourceToken.decimals, 
          targetToken.decimals, 
          params.slippageTolerance
        );
      
      const minAmountOutWei = parseUnits(minAmountOut, targetToken.decimals);
      
      // Calculate deadline
      const deadline = this.calculateDeadline(params.deadlineMinutes);
      
      // Create transaction parameters
      const receiverAddress = params.receiver ? this.ensureChecksumAddress(params.receiver) : this.ensureChecksumAddress(walletAddress);
      
      // Arguments for swapExactIn function
      const swapArgs = {
        logic: LOGIC_ROUTER_ADDRESS_ALT, // Different logic router for USDT to MNT
        tokenIn: sourceToken.address,
        tokenOut: targetToken.address, // Zero address for native token
        amountIn: amountInWei,
        amountOutMin: minAmountOutWei,
        to: receiverAddress,
        deadline,
        route: DEFAULT_USDT_TO_MNT_ROUTE as `0x${string}`
      };
      
      // Create encoded transaction data
      const data = encodeFunctionData({
        abi: MERCHANT_MOE_ROUTER_ABI,
        functionName: "swapExactIn",
        args: [
          swapArgs.logic,
          swapArgs.tokenIn,
          swapArgs.tokenOut,
          swapArgs.amountIn,
          swapArgs.amountOutMin,
          swapArgs.to,
          swapArgs.deadline,
          swapArgs.route
        ]
      });
      
      console.log(`Swapping ${params.amount} USDT to MNT with min out: ${minAmountOut} MNT`);
      console.log(`Input token address: ${sourceToken.address}`);
      console.log(`Output token address: ${targetToken.address}`);
      
      // For debugging purposes, log the transaction details
      console.log('Transaction details:', {
        to: MERCHANT_MOE_ROUTER_ADDRESS,
        value: "0", // No native value for ERC20 swap
        data: data.substring(0, 66) + "...", // Truncate data for logging
        walletAddress: walletAddress
      });
      
      // Send the swap transaction using createPendingTransaction utility
      const txHash = await createPendingTransaction(
        MERCHANT_MOE_ROUTER_ADDRESS,
        "0", // No native value for ERC20 swap
        data,
        walletAddress,
        { chain: 'mantle' } // Explicitly specify the chain
      );
      
      // Return success message with transaction details
      return `✅ Successfully initiated swap of ${params.amount} USDT to at least ${minAmountOut} MNT. Transaction ID: ${txHash}`;
    } catch (error) {
      console.error(`Error swapping USDT to MNT:`, error);
      if (error instanceof WrongNetworkError ||
          error instanceof InsufficientBalanceError ||
          error instanceof InsufficientAllowanceError) {
        return `❌ ${error.message}`;
      } else if (error instanceof Error) {
        return `❌ Error swapping USDT to MNT: ${error.message}`;
      }
      return `❌ An unknown error occurred while swapping USDT to MNT.`;
    }
  }

  /**
   * Check if the action provider supports a given network
   */
  supportsNetwork = (network: Network): boolean => {
    return network.chainId === MANTLE_CHAIN_ID.toString();
  };
}

export const merchantMoeActionProvider = () => new MerchantMoeActionProvider();