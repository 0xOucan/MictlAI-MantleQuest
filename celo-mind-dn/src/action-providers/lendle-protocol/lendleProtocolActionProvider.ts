import { z } from "zod";
import {
  ActionProvider,
  Network,
  CreateAction,
  EvmWalletProvider,
  WalletProvider,
} from "@coinbase/agentkit";
import { encodeFunctionData, parseUnits, formatUnits, createPublicClient, http } from "viem";
import type { Hex } from "viem";
import "reflect-metadata";
import {
  DepositMNTSchema,
  WithdrawMNTSchema,
  GetUserAccountDataSchema,
  GetReserveDataSchema,
  ApproveUSDTSchema,
  DepositUSDTSchema,
} from "./schemas";
import {
  ChainConstants,
  LENDLE_WETH_GATEWAY_ABI,
  LENDLE_LENDING_POOL_ABI,
  TOKEN_DECIMALS,
  ERC20_TOKEN_ABI
} from "./constants";
import {
  LendleError,
  InsufficientBalanceError,
  InsufficientUSDTBalanceError,
  WrongNetworkError,
  TransactionFailedError,
  DepositNotAvailableError,
  InsufficientCollateralError,
  HealthFactorTooLowError,
  ApprovalFailedError,
  InsufficientAllowanceError
} from "./errors";
import { mantle } from "viem/chains";
import { createPendingTransaction } from "../../utils/transaction-utils";

// Create a public client for direct Mantle RPC access
const mantleClient = createPublicClient({
  chain: mantle,
  transport: http(mantle.rpcUrls.default.http[0]),
});

/**
 * 🏦 LendleProtocolActionProvider provides actions for interacting with Lendle Protocol on Mantle
 */
export class LendleProtocolActionProvider extends ActionProvider<EvmWalletProvider> {
  private walletProvider: EvmWalletProvider;

  constructor(walletProvider: WalletProvider) {
    super("lendle-protocol", []);
    this.walletProvider = walletProvider as EvmWalletProvider;
    console.log("LendleProtocolActionProvider initialized for Mantle network");
  }

  /**
   * 🌐 Check if we're on Mantle network
   */
  private async checkNetwork(walletProvider: EvmWalletProvider): Promise<void> {
    const network = await walletProvider.getNetwork();
    if (network.chainId !== ChainConstants.CHAIN_ID.toString()) {
      throw new WrongNetworkError();
    }
  }

  /**
   * Get the wallet's MNT balance directly from Mantle network
   */
  private async getWalletMNTBalance(walletAddress: string): Promise<bigint> {
    try {
      console.log(`Getting MNT balance directly from Mantle RPC for ${walletAddress}`);
      const balance = await mantleClient.getBalance({
        address: walletAddress as `0x${string}`
      });
      console.log(`Direct MNT balance check: ${formatUnits(balance, 18)} MNT`);
      return balance;
    } catch (error) {
      console.error(`Error getting direct MNT balance:`, error);
      throw new LendleError(`Failed to fetch MNT balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the wallet's USDT balance
   */
  private async getWalletUSDTBalance(walletProvider: EvmWalletProvider, walletAddress: string): Promise<bigint> {
    try {
      console.log(`Getting USDT balance for ${walletAddress}`);
      const balance = await walletProvider.readContract({
        address: ChainConstants.USDT_TOKEN as `0x${string}`,
        abi: ERC20_TOKEN_ABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      });
      
      console.log(`USDT balance: ${formatUnits(balance as bigint, TOKEN_DECIMALS.USDT)} USDT`);
      return balance as bigint;
    } catch (error) {
      console.error(`Error getting USDT balance:`, error);
      throw new LendleError(`Failed to fetch USDT balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the wallet's USDT allowance for Lendle
   */
  private async getUSDTAllowance(walletProvider: EvmWalletProvider, walletAddress: string): Promise<bigint> {
    try {
      console.log(`Getting USDT allowance for ${walletAddress}`);
      const allowance = await walletProvider.readContract({
        address: ChainConstants.USDT_TOKEN as `0x${string}`,
        abi: ERC20_TOKEN_ABI,
        functionName: "allowance",
        args: [
          walletAddress as `0x${string}`,
          ChainConstants.LENDLE_LENDING_POOL as `0x${string}`
        ],
      });
      
      console.log(`USDT allowance: ${formatUnits(allowance as bigint, TOKEN_DECIMALS.USDT)} USDT`);
      return allowance as bigint;
    } catch (error) {
      console.error(`Error getting USDT allowance:`, error);
      throw new LendleError(`Failed to fetch USDT allowance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 💰 Check if user has enough MNT balance
   */
  private async checkMNTBalance(
    walletProvider: EvmWalletProvider,
    amount: bigint
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    
    // First try using direct RPC call to get the correct balance
    let balance: bigint;
    try {
      balance = await this.getWalletMNTBalance(address);
    } catch (error) {
      console.warn(`Failed to get balance directly, falling back to wallet provider:`, error);
      balance = await walletProvider.getBalance();
    }
    
    console.log(`Checking MNT balance: Address ${address} has ${formatUnits(balance, 18)} MNT, needs ${formatUnits(amount, 18)} MNT`);

    if (balance < amount) {
      const formattedBalance = formatUnits(balance, 18);
      const formattedAmount = formatUnits(amount, 18);
      
      throw new InsufficientBalanceError(
        formattedBalance,
        formattedAmount
      );
    }
  }

  /**
   * 💰 Check if user has enough USDT balance
   */
  private async checkUSDTBalance(
    walletProvider: EvmWalletProvider,
    amount: bigint
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    const balance = await this.getWalletUSDTBalance(walletProvider, address);
    
    console.log(`Checking USDT balance: Address ${address} has ${formatUnits(balance, TOKEN_DECIMALS.USDT)} USDT, needs ${formatUnits(amount, TOKEN_DECIMALS.USDT)} USDT`);

    if (balance < amount) {
      const formattedBalance = formatUnits(balance, TOKEN_DECIMALS.USDT);
      const formattedAmount = formatUnits(amount, TOKEN_DECIMALS.USDT);
      
      throw new InsufficientUSDTBalanceError(
        formattedBalance,
        formattedAmount
      );
    }
  }

  /**
   * 💰 Check if user has enough USDT allowance
   */
  private async checkUSDTAllowance(
    walletProvider: EvmWalletProvider,
    amount: bigint
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    const allowance = await this.getUSDTAllowance(walletProvider, address);
    
    console.log(`Checking USDT allowance: Address ${address} has ${formatUnits(allowance, TOKEN_DECIMALS.USDT)} USDT allowance, needs ${formatUnits(amount, TOKEN_DECIMALS.USDT)} USDT`);

    if (allowance < amount) {
      const formattedAllowance = formatUnits(allowance, TOKEN_DECIMALS.USDT);
      const formattedAmount = formatUnits(amount, TOKEN_DECIMALS.USDT);
      
      throw new InsufficientAllowanceError(
        formattedAllowance,
        formattedAmount
      );
    }
  }

  /**
   * 🌐 Get Mantlescan link for transaction
   */
  private getMantlescanLink(txHash: string): string {
    return `https://mantlescan.xyz/tx/${txHash}`;
  }

  /**
   * 📝 Format transaction success message
   */
  private getTransactionMessage(action: string, amount: string, token: string = "MNT"): string {
    return `I've submitted your request to ${action} ${amount} ${token}. 

The transaction has been sent to your wallet for signing. Once signed, it will be processed on the blockchain.

You can monitor the status in the Transactions panel.`;
  }

  /**
   * 💱 Format MNT amount with proper decimals
   */
  private formatMNTAmount(amount: bigint): string {
    return formatUnits(amount, 18);
  }

  /**
   * 💱 Format USDT amount with proper decimals
   */
  private formatUSDTAmount(amount: bigint): string {
    return formatUnits(amount, TOKEN_DECIMALS.USDT);
  }

  /**
   * 💱 Parse MNT amount to appropriate units
   */
  private parseMNTAmount(amount: string): bigint {
    try {
      // Ensure amount is a valid number
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        console.error(`Invalid amount format: ${amount}`);
        throw new Error(`Invalid amount format: ${amount}`);
      }
      
      // Ensure amount is positive
      if (numAmount <= 0) {
        console.error(`Amount must be positive: ${amount}`);
        throw new Error(`Amount must be positive: ${amount}`);
      }
      
      // If the amount has more than 18 decimal places, truncate it
      const match = amount.match(/^(\d+)\.(\d+)$/);
      if (match && match[2].length > 18) {
        const truncated = `${match[1]}.${match[2].substring(0, 18)}`;
        console.log(`Truncating amount from ${amount} to ${truncated} (max 18 decimals)`);
        amount = truncated;
      }
      
      console.log(`Parsing MNT amount: ${amount} -> ${parseUnits(amount, 18)} wei`);
      return parseUnits(amount, 18);
    } catch (error) {
      console.error(`Error parsing amount ${amount}:`, error);
      // Return a default value of 0 (this shouldn't happen if validation is proper)
      throw new Error(`Failed to parse amount "${amount}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 💱 Parse USDT amount to appropriate units
   */
  private parseUSDTAmount(amount: string): bigint {
    try {
      // Ensure amount is a valid number
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        console.error(`Invalid amount format: ${amount}`);
        throw new Error(`Invalid amount format: ${amount}`);
      }
      
      // Ensure amount is positive
      if (numAmount <= 0) {
        console.error(`Amount must be positive: ${amount}`);
        throw new Error(`Amount must be positive: ${amount}`);
      }
      
      // If the amount has more than 6 decimal places, truncate it
      const match = amount.match(/^(\d+)\.(\d+)$/);
      if (match && match[2].length > TOKEN_DECIMALS.USDT) {
        const truncated = `${match[1]}.${match[2].substring(0, TOKEN_DECIMALS.USDT)}`;
        console.log(`Truncating amount from ${amount} to ${truncated} (max ${TOKEN_DECIMALS.USDT} decimals)`);
        amount = truncated;
      }
      
      console.log(`Parsing USDT amount: ${amount} -> ${parseUnits(amount, TOKEN_DECIMALS.USDT)} units`);
      return parseUnits(amount, TOKEN_DECIMALS.USDT);
    } catch (error) {
      console.error(`Error parsing amount ${amount}:`, error);
      throw new Error(`Failed to parse amount "${amount}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 💰 Get user account data from Lendle lending pool
   */
  private async getUserAccountDataRaw(
    walletProvider: EvmWalletProvider,
    userAddress: string
  ): Promise<any> {
    try {
      console.log(`Reading account data from Lendle Lending Pool for ${userAddress}`);
      const result = await walletProvider.readContract({
        address: ChainConstants.LENDLE_LENDING_POOL as `0x${string}`,
        abi: LENDLE_LENDING_POOL_ABI,
        functionName: "getUserAccountData",
        args: [userAddress as `0x${string}`],
      });
      
      console.log(`Account data successfully retrieved from Lendle Lending Pool:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting user account data from Lendle Lending Pool:`, error);
      
      // Check if it's a specific error we can handle better
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("execution reverted") || errorMsg.includes("call revert exception")) {
        console.log(`Contract execution reverted, the user likely has no position in the Lendle Protocol`);
        throw new LendleError("No position found in Lendle Protocol. You may need to supply MNT first.");
      }
      
      throw new LendleError(`Failed to retrieve user account data from Lendle Protocol: ${errorMsg}`);
    }
  }

  /**
   * 💼 Get user account data
   */
  @CreateAction({
    schema: GetUserAccountDataSchema,
    name: "getUserAccountData",
    description: "Get user's account data from Lendle Protocol",
  })
  async getUserAccountData(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetUserAccountDataSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    // Get the address to check
    const address = args.address || await walletProvider.getAddress();
    console.log(`Getting account data for address: ${address}`);
    
    try {
      // Get the user's account data
      const accountData = await this.getUserAccountDataRaw(
        walletProvider,
        address
      );
      
      // Extract and format the account data
      const totalCollateralETH = this.formatMNTAmount(accountData[0] as bigint);
      const totalDebtETH = this.formatMNTAmount(accountData[1] as bigint);
      const availableBorrowsETH = this.formatMNTAmount(accountData[2] as bigint);
      const liquidationThreshold = ((accountData[3] as bigint) / BigInt(100)).toString() + "%";
      const ltv = ((accountData[4] as bigint) / BigInt(100)).toString() + "%";
      const healthFactor = this.formatMNTAmount(accountData[5] as bigint);
      
      console.log(`Account data retrieved successfully:
  - Total Collateral: ${totalCollateralETH} MNT
  - Total Debt: ${totalDebtETH} MNT
  - Available to Borrow: ${availableBorrowsETH} MNT
  - Liquidation Threshold: ${liquidationThreshold}
  - LTV: ${ltv}
  - Health Factor: ${healthFactor}`);
      
      // Get native MNT balance directly from Mantle RPC
      let nativeBalance: bigint;
      try {
        nativeBalance = await this.getWalletMNTBalance(address);
      } catch (error) {
        console.warn(`Failed to get direct balance, falling back to wallet provider:`, error);
        nativeBalance = await walletProvider.getBalance();
      }
      
      const formattedNativeBalance = formatUnits(nativeBalance, 18);
      console.log(`Native MNT balance: ${formattedNativeBalance} MNT`);
      
      // Create the user account data summary
      return `
## 🏦 Lendle Protocol Account Summary

**Address**: ${address}

### Position Details
- 💰 Total Collateral: ${totalCollateralETH} MNT
- 💸 Total Debt: ${totalDebtETH} MNT
- 💵 Available to Borrow: ${availableBorrowsETH} MNT
- 📊 Liquidation Threshold: ${liquidationThreshold}
- 📈 Loan to Value: ${ltv}
- ❤️ Health Factor: ${healthFactor}

### Wallet Details
- 🔶 Native MNT Balance: ${formattedNativeBalance} MNT

Your health factor is a key risk indicator. A value below 1.0 will result in liquidation.
`;
    } catch (error) {
      console.error(`Error getting user account data:`, error);
      
      // Check if the user has any MNT at all - using direct RPC call
      let nativeBalance: bigint;
      try {
        nativeBalance = await this.getWalletMNTBalance(address);
      } catch (directError) {
        console.warn(`Failed to get direct balance, falling back to wallet provider:`, directError);
        nativeBalance = await walletProvider.getBalance();
      }
      
      const formattedNativeBalance = formatUnits(nativeBalance, 18);
      
      console.log(`Failed to get account data, but native MNT balance is: ${formattedNativeBalance} MNT`);
      
      // Return a simplified response with just the native balance
      return `
## 🏦 Lendle Protocol

**Address**: ${address}

No active position found in Lendle Protocol.

### Wallet Details
- 🔶 Native MNT Balance: ${formattedNativeBalance} MNT

You can use your MNT to supply collateral to Lendle Protocol.
`;
    }
  }

  /**
   * 📥 Deposit MNT as collateral
   */
  @CreateAction({
    schema: DepositMNTSchema,
    name: "depositMNT",
    description: "Deposit MNT as collateral in Lendle Protocol",
  })
  async depositMNT(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof DepositMNTSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    // Parse the amount to the appropriate token units
    const parsedAmount = this.parseMNTAmount(args.amount);
    console.log(`Depositing MNT: ${args.amount} MNT parsed to ${parsedAmount.toString()} wei`);
    
    // Check if the user has enough balance
    await this.checkMNTBalance(
      walletProvider,
      parsedAmount
    );
    
    // Get the caller's address
    const callerAddress = await walletProvider.getAddress();
    
    // Get the onBehalfOf address (default to caller if not specified)
    const onBehalfOf = args.onBehalfOf || callerAddress;
    
    // Encode the deposit function call
    const data = encodeFunctionData({
      abi: LENDLE_WETH_GATEWAY_ABI,
      functionName: "depositETH",
      args: [
        ChainConstants.LENDLE_LENDING_POOL as `0x${string}`,
        onBehalfOf as `0x${string}`,
        0, // referralCode (0)
      ],
    });
    
    // Create the transaction object
    const txRequest = {
      to: ChainConstants.LENDLE_WETH_GATEWAY as `0x${string}`,
      data: data as Hex,
      value: parsedAmount,
    };
    
    console.log(`Preparing Lendle deposit transaction:`, {
      to: ChainConstants.LENDLE_WETH_GATEWAY,
      value: formatUnits(parsedAmount, 18),
      functionName: "depositETH",
      lendingPool: ChainConstants.LENDLE_LENDING_POOL,
      onBehalfOf
    });
    
    // Send the transaction
    try {
      const txHash = await walletProvider.sendTransaction(txRequest);
      console.log(`Transaction sent! Hash: ${txHash}`);
      
      // Format the amount for display
      const formattedAmount = this.formatMNTAmount(parsedAmount);
      
      return this.getTransactionMessage("deposit", formattedAmount);
    } catch (error) {
      console.error("Failed to send deposit transaction:", error);
      throw new TransactionFailedError(
        error instanceof Error ? error.message : "Unknown transaction error"
      );
    }
  }

  /**
   * 📤 Withdraw MNT collateral
   */
  @CreateAction({
    schema: WithdrawMNTSchema,
    name: "withdrawMNT",
    description: "Withdraw MNT collateral from Lendle Protocol",
  })
  async withdrawMNT(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof WithdrawMNTSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    // Get the user's address
    const address = await walletProvider.getAddress();
    console.log(`Withdrawing MNT for address: ${address}`);
    
    // Get native MNT balance directly to confirm we're using the right wallet
    try {
      const directBalance = await this.getWalletMNTBalance(address);
      console.log(`Direct MNT balance before withdrawal: ${formatUnits(directBalance, 18)} MNT`);
    } catch (error) {
      console.warn("Unable to get direct MNT balance, continuing with withdrawal attempt:", error);
    }
    
    // Get the user's account data
    const accountData = await this.getUserAccountDataRaw(
      walletProvider,
      address
    );
    
    // Get the total collateral in ETH (MNT)
    const totalCollateral = accountData[0] as bigint;
    console.log(`Total collateral: ${this.formatMNTAmount(totalCollateral)} MNT`);
    
    // Determine the amount to withdraw
    let amountToWithdraw: bigint;
    if (args.amount === "-1") {
      // Withdraw the entire collateral
      amountToWithdraw = totalCollateral;
      console.log(`Withdrawing entire collateral: ${this.formatMNTAmount(totalCollateral)} MNT`);
    } else {
      try {
        // Parse the amount to the appropriate token units
        amountToWithdraw = this.parseMNTAmount(args.amount);
        console.log(`Withdrawing ${args.amount} MNT (${amountToWithdraw} wei)`);
      } catch (error) {
        console.error(`Error parsing withdrawal amount:`, error);
        throw new LendleError(`Invalid withdrawal amount: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Check if the user has enough collateral
    if (totalCollateral < amountToWithdraw) {
      const formattedCollateral = this.formatMNTAmount(totalCollateral);
      const formattedWithdrawAmount = this.formatMNTAmount(amountToWithdraw);
      console.error(`Insufficient collateral: has ${formattedCollateral} MNT, trying to withdraw ${formattedWithdrawAmount} MNT`);
      
      throw new InsufficientCollateralError(
        formattedCollateral,
        formattedWithdrawAmount
      );
    }
    
    // Get the health factor
    const healthFactor = accountData[5] as bigint;
    const formattedHealthFactor = this.formatMNTAmount(healthFactor);
    console.log(`Health factor: ${formattedHealthFactor}`);
    
    // Check if withdrawal would put the health factor below 1.0
    // This is a simplified check, in a real implementation you would recalculate the health factor
    if (amountToWithdraw > totalCollateral / BigInt(2) && healthFactor < parseUnits("1.5", 18)) {
      console.error(`Health factor too low: ${formattedHealthFactor}, required 1.5`);
      throw new HealthFactorTooLowError(
        formattedHealthFactor,
        "1.5"
      );
    }
    
    // Get the onBehalfOf address (default to caller if not specified)
    const onBehalfOf = args.onBehalfOf || address;
    
    // Encode the withdraw function call
    const data = encodeFunctionData({
      abi: LENDLE_WETH_GATEWAY_ABI,
      functionName: "withdrawETH",
      args: [
        ChainConstants.LENDLE_LENDING_POOL as `0x${string}`,
        amountToWithdraw,
        onBehalfOf as `0x${string}`,
        0, // referralCode (0)
      ],
    });
    
    console.log(`Sending withdrawal transaction`);
    
    // Send the transaction
    const txHash = await walletProvider.sendTransaction({
      to: ChainConstants.LENDLE_WETH_GATEWAY as `0x${string}`,
      data: data as Hex,
    });
    
    console.log(`Withdrawal transaction sent: ${txHash}`);
    
    // Format the amount for display
    const formattedAmount = this.formatMNTAmount(amountToWithdraw);
    
    return this.getTransactionMessage("withdraw", formattedAmount);
  }

  /**
   * 👍 Approve USDT for Lendle Protocol
   */
  @CreateAction({
    schema: ApproveUSDTSchema,
    name: "approveUSDT",
    description: "Approve USDT to be used by Lendle Protocol",
  })
  async approveUSDT(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof ApproveUSDTSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    // Get the caller's address
    const callerAddress = await walletProvider.getAddress();
    
    // Get current USDT balance
    const balance = await this.getWalletUSDTBalance(walletProvider, callerAddress);
    
    // Parse the amount to the appropriate token units or use maximum if "-1"
    let parsedAmount: bigint;
    if (args.amount === "-1") {
      // Use the maximum possible amount for ERC20 tokens
      parsedAmount = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935"); // 2^256 - 1
      console.log(`Approving maximum USDT allowance`);
    } else {
      parsedAmount = this.parseUSDTAmount(args.amount);
      console.log(`Approving USDT: ${args.amount} USDT parsed to ${parsedAmount.toString()} units`);
      
      // Check if user has enough USDT
      if (parsedAmount > balance) {
        throw new InsufficientUSDTBalanceError(
          this.formatUSDTAmount(balance),
          args.amount
        );
      }
    }
    
    // Encode the approve function call
    const data = encodeFunctionData({
      abi: ERC20_TOKEN_ABI,
      functionName: "approve",
      args: [
        ChainConstants.LENDLE_LENDING_POOL as `0x${string}`,
        parsedAmount,
      ],
    });
    
    console.log(`Preparing USDT approval transaction:`, {
      to: ChainConstants.USDT_TOKEN,
      spender: ChainConstants.LENDLE_LENDING_POOL,
      amount: args.amount === "-1" ? "MAX" : args.amount,
    });
    
    // Send the transaction
    try {
      // Create a pending transaction record for UI display
      createPendingTransaction(
        ChainConstants.USDT_TOKEN as `0x${string}`,
        "0", 
        data,
        callerAddress,
        { 
          chain: 'mantle',
          dataType: 'token-approval',
          displayAmount: args.amount,
          displaySymbol: 'USDT',
          targetContract: ChainConstants.LENDLE_LENDING_POOL
        }
      );
      
      const txHash = await walletProvider.sendTransaction({
        to: ChainConstants.USDT_TOKEN as `0x${string}`,
        data: data as Hex,
        value: BigInt(0),
      });
      
      console.log(`Transaction sent! Hash: ${txHash}`);
      
      // Format the amount for display
      const formattedAmount = args.amount === "-1" ? "unlimited" : args.amount;
      
      return `I've submitted your request to approve ${formattedAmount} USDT for Lendle Protocol.

The transaction has been sent to your wallet for signing. Once signed, you'll be able to supply USDT as collateral.

You can monitor the status in the Transactions panel.`;
    } catch (error) {
      console.error("Failed to send approval transaction:", error);
      throw new ApprovalFailedError(
        error instanceof Error ? error.message : "Unknown transaction error"
      );
    }
  }

  /**
   * 📥 Deposit USDT as collateral
   */
  @CreateAction({
    schema: DepositUSDTSchema,
    name: "depositUSDT",
    description: "Deposit USDT as collateral in Lendle Protocol",
  })
  async depositUSDT(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof DepositUSDTSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    // Parse the amount to the appropriate token units
    const parsedAmount = this.parseUSDTAmount(args.amount);
    console.log(`Depositing USDT: ${args.amount} USDT parsed to ${parsedAmount.toString()} units`);
    
    // Check if the user has enough USDT balance
    await this.checkUSDTBalance(
      walletProvider,
      parsedAmount
    );
    
    // Check if the user has enough allowance
    await this.checkUSDTAllowance(
      walletProvider,
      parsedAmount
    );
    
    // Get the caller's address
    const callerAddress = await walletProvider.getAddress();
    
    // Get the onBehalfOf address (default to caller if not specified)
    const onBehalfOf = args.onBehalfOf || callerAddress;
    
    // Encode the deposit function call
    const data = encodeFunctionData({
      abi: LENDLE_LENDING_POOL_ABI,
      functionName: "deposit",
      args: [
        ChainConstants.USDT_TOKEN as `0x${string}`,
        parsedAmount,
        onBehalfOf as `0x${string}`,
        0, // referralCode (0)
      ],
    });
    
    console.log(`Preparing USDT deposit transaction:`, {
      to: ChainConstants.LENDLE_LENDING_POOL,
      asset: ChainConstants.USDT_TOKEN,
      value: args.amount,
      onBehalfOf
    });
    
    // Send the transaction
    try {
      // Create a pending transaction record for UI display
      createPendingTransaction(
        ChainConstants.LENDLE_LENDING_POOL as `0x${string}`,
        "0", 
        data,
        callerAddress,
        { 
          chain: 'mantle',
          dataType: 'lendle-usdt-deposit',
          displayAmount: args.amount,
          displaySymbol: 'USDT',
          targetAsset: ChainConstants.USDT_TOKEN
        }
      );
      
      const txHash = await walletProvider.sendTransaction({
        to: ChainConstants.LENDLE_LENDING_POOL as `0x${string}`,
        data: data as Hex,
        value: BigInt(0),
      });
      
      console.log(`Transaction sent! Hash: ${txHash}`);
      
      return this.getTransactionMessage("deposit", args.amount, "USDT");
    } catch (error) {
      console.error("Failed to send deposit transaction:", error);
      throw new TransactionFailedError(
        error instanceof Error ? error.message : "Unknown transaction error"
      );
    }
  }

  /**
   * Check if the action provider supports the current network
   */
  supportsNetwork = (network: Network): boolean => {
    return network.chainId === ChainConstants.CHAIN_ID.toString();
  };

  /**
   * Deposit MNT as collateral in Lendle Protocol
   */
  async supplyMNT(amount: string): Promise<string> {
    try {
      // Get wallet address
      const walletAddress = await this.walletProvider.getAddress();
      console.log(`Using wallet address: ${walletAddress} on Mantle network`);

      // Check MNT balance directly from Mantle RPC
      let balance: bigint;
      try {
        balance = await this.getWalletMNTBalance(walletAddress);
      } catch (error) {
        console.warn(`Failed to get direct balance, falling back to wallet provider:`, error);
        balance = await this.walletProvider.getBalance();
      }
      
      console.log(`MNT balance: ${formatUnits(balance, 18)} MNT`);
      
      // Convert amount to wei
      const amountInWei = parseUnits(amount, 18);
      console.log(`Amount to deposit: ${amount} MNT (${amountInWei} wei)`);
      
      // Ensure user has enough MNT
      if (balance < amountInWei) {
        throw new InsufficientBalanceError(
          formatUnits(balance, 18),
          amount
        );
      }

      // Create deposit transaction
      const tx = {
        to: ChainConstants.LENDLE_WETH_GATEWAY as `0x${string}`,
        data: encodeFunctionData({
          abi: LENDLE_WETH_GATEWAY_ABI,
          functionName: "depositETH",
          args: [
            ChainConstants.LENDLE_LENDING_POOL as `0x${string}`,
            walletAddress as `0x${string}`,
            0, // referralCode (0)
          ],
        }),
        value: amountInWei,
      };
      
      console.log(`Sending deposit transaction on Mantle network: depositing ${amount} MNT to Lendle Protocol`);

      // Send transaction
      const txHash = await this.walletProvider.sendTransaction(tx);
      console.log(`Deposit transaction sent on Mantle: ${txHash}`);

      return `I've initiated the deposit of ${amount} MNT as collateral in the Lendle Protocol. Please check your wallet to sign the transaction. Your MNT will be deposited once the transaction is confirmed.`;
    } catch (error) {
      console.error("Error depositing MNT to Lendle Protocol:", error);
      throw new LendleError(`Failed to deposit MNT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const lendleProtocolActionProvider = (walletProvider: WalletProvider) => new LendleProtocolActionProvider(walletProvider); 