import { z } from "zod";
import {
  ActionProvider,
  Network,
  CreateAction,
  EvmWalletProvider,
  WalletProvider,
} from "@coinbase/agentkit";
import { encodeFunctionData, parseUnits, formatUnits } from "viem";
import type { Hex } from "viem";
import "reflect-metadata";
import {
  ApproveTokenSchema,
  StakeTokensSchema,
  WithdrawStakedSchema,
  DirectStakeSchema,
  GetUserStakingDataSchema,
} from "./schemas";
import {
  ChainConstants,
  TreehouseToken,
  ERC20_ABI,
  TREEHOUSE_STAKING_ABI,
} from "./constants";
import {
  TreehouseError,
  InsufficientBalanceError,
  InsufficientAllowanceError,
  WrongNetworkError,
  TransactionFailedError,
  StakingNotAvailableError,
  InsufficientStakedBalanceError,
} from "./errors";
import { mantle } from "viem/chains";

/**
 * 🌳 TreehouseProtocolActionProvider provides actions for interacting with Treehouse Protocol on Mantle
 */
export class TreehouseProtocolActionProvider extends ActionProvider<EvmWalletProvider> {
  private walletProvider: EvmWalletProvider;

  constructor(walletProvider: WalletProvider) {
    super("treehouse-protocol", []);
    this.walletProvider = walletProvider as EvmWalletProvider;
    console.log("TreehouseProtocolActionProvider initialized for Mantle network");
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
   * 🪙 Get token address based on the token enum
   */
  private getTokenAddress(token: TreehouseToken): string {
    switch (token) {
      case TreehouseToken.CM_ETH:
        return ChainConstants.CMETH_TOKEN_ADDRESS;
      default:
        throw new TreehouseError(`Unsupported token: ${token}`);
    }
  }

  /**
   * 💰 Check if user has enough token balance
   */
  private async checkTokenBalance(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    amount: string
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    const balance = await walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    }) as bigint;

    if (balance < BigInt(amount)) {
      const tokenSymbol = await this.getTokenSymbol(walletProvider, tokenAddress);
      const formattedBalance = await this.formatTokenAmount(walletProvider, tokenAddress, balance);
      const formattedAmount = await this.formatTokenAmount(walletProvider, tokenAddress, BigInt(amount));
      
      throw new InsufficientBalanceError(
        tokenSymbol,
        formattedBalance,
        formattedAmount
      );
    }
  }

  /**
   * 🔒 Check token allowance
   */
  private async checkTokenAllowance(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    const allowance = await walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address as `0x${string}`, spender as `0x${string}`],
    }) as bigint;

    if (allowance < BigInt(amount)) {
      const tokenSymbol = await this.getTokenSymbol(walletProvider, tokenAddress);
      const formattedAllowance = await this.formatTokenAmount(walletProvider, tokenAddress, allowance);
      const formattedAmount = await this.formatTokenAmount(walletProvider, tokenAddress, BigInt(amount));
      
      throw new InsufficientAllowanceError(
        tokenSymbol,
        formattedAllowance,
        formattedAmount
      );
    }
  }

  /**
   * Get token allowance
   */
  private async getTokenAllowance(
    tokenAddress: string,
    spender: string
  ): Promise<string> {
    const address = await this.walletProvider.getAddress();
    const allowance = await this.walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address as `0x${string}`, spender as `0x${string}`],
    }) as bigint;

    return this.formatTokenAmount(this.walletProvider, tokenAddress, allowance);
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
  private getTransactionMessage(action: string, token: string, amount: string): string {
    return `I've submitted your request to ${action} ${amount} ${token}. 

The transaction has been sent to your wallet for signing. Once signed, it will be processed on the blockchain.

You can monitor the status in the Transactions panel.`;
  }

  /**
   * 🔖 Format approval transaction success message
   */
  private getApprovalMessage(token: string, amount: string): string {
    return `I've requested approval for ${amount} ${token} tokens for Treehouse Protocol.

Please check your wallet to sign the approval transaction.

You can monitor the status in the Transactions panel.`;
  }

  /**
   * 💱 Format token amount with proper decimals
   */
  private async formatTokenAmount(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    amount: bigint
  ): Promise<string> {
    try {
      const decimals = await walletProvider.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
      }) as number;
      
      return formatUnits(amount, decimals);
    } catch (error) {
      console.error("Error formatting token amount:", error);
      return amount.toString();
    }
  }

  /**
   * 💱 Parse token amount to appropriate units based on decimals
   */
  private async parseTokenAmount(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    amount: string
  ): Promise<bigint> {
    try {
      const decimals = await walletProvider.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
      }) as number;
      
      return parseUnits(amount, decimals);
    } catch (error) {
      console.error("Error parsing token amount:", error);
      return BigInt(amount);
    }
  }

  /**
   * 🔖 Get token symbol
   */
  private async getTokenSymbol(
    walletProvider: EvmWalletProvider,
    tokenAddress: string
  ): Promise<string> {
    try {
      return await walletProvider.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "symbol",
      }) as string;
    } catch (error) {
      console.error("Error getting token symbol:", error);
      return "Unknown";
    }
  }

  /**
   * 📝 Check staking eligibility
   */
  private checkStakingEligibility(token: TreehouseToken): void {
    // All listed tokens are eligible for staking in this implementation
    // This method can be expanded in the future if needed
  }

  /**
   * 💰 Get user staked balance
   */
  private async getUserStakedBalance(
    walletProvider: EvmWalletProvider,
    userAddress: string,
    tokenAddress: string
  ): Promise<bigint> {
    try {
      return await walletProvider.readContract({
        address: ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`,
        abi: TREEHOUSE_STAKING_ABI,
        functionName: "getStakedAmount",
        args: [userAddress as `0x${string}`, tokenAddress as `0x${string}`],
      }) as bigint;
    } catch (error) {
      console.error("Error getting staked balance:", error);
      return BigInt(0);
    }
  }

  /**
   * 👍 Approve token for staking
   */
  @CreateAction({
    schema: ApproveTokenSchema,
    name: "approveForStaking",
    description: "Approve tokens to be staked in Treehouse Protocol",
  })
  async approveToken(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof ApproveTokenSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const tokenAddress = this.getTokenAddress(args.token as TreehouseToken);
    
    // Parse the amount to the appropriate token units
    const parsedAmount = await this.parseTokenAmount(
      walletProvider,
      tokenAddress,
      args.amount
    );
    
    // Check if the user has enough balance
    await this.checkTokenBalance(
      walletProvider,
      tokenAddress,
      parsedAmount.toString()
    );
    
    // Encode the approval function call
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`, parsedAmount],
    });
    
    // Send the transaction
    const txHash = await walletProvider.sendTransaction({
      to: tokenAddress as `0x${string}`,
      data: data as Hex,
    });
    
    // Format the amount for display
    const formattedAmount = await this.formatTokenAmount(
      walletProvider,
      tokenAddress,
      parsedAmount
    );
    
    return this.getApprovalMessage(args.token, formattedAmount);
  }

  /**
   * 🥩 Stake tokens
   */
  @CreateAction({
    schema: StakeTokensSchema,
    name: "stakeTokens",
    description: "Stake tokens in Treehouse Protocol",
  })
  async stakeTokens(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof StakeTokensSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const tokenAddress = this.getTokenAddress(args.token as TreehouseToken);
    this.checkStakingEligibility(args.token as TreehouseToken);
    
    // Parse the amount to the appropriate token units
    const parsedAmount = await this.parseTokenAmount(
      walletProvider,
      tokenAddress,
      args.amount
    );
    
    // Check if the user has enough balance
    await this.checkTokenBalance(
      walletProvider,
      tokenAddress,
      parsedAmount.toString()
    );
    
    // Check if the user has enough allowance
    await this.checkTokenAllowance(
      walletProvider,
      tokenAddress,
      ChainConstants.TREEHOUSE_STAKING_CONTRACT,
      parsedAmount.toString()
    );
    
    // Get the receiver address (default to caller if not specified)
    const callerAddress = await walletProvider.getAddress();
    const receiver = args.receiver || callerAddress;
    
    // Encode the stake function call
    const data = encodeFunctionData({
      abi: TREEHOUSE_STAKING_ABI,
      functionName: "deposit",
      args: [
        tokenAddress as `0x${string}`,
        parsedAmount,
        receiver as `0x${string}`,
      ],
    });
    
    // Send the transaction
    const txHash = await walletProvider.sendTransaction({
      to: ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`,
      data: data as Hex,
    });
    
    // Format the amount for display
    const formattedAmount = await this.formatTokenAmount(
      walletProvider,
      tokenAddress,
      parsedAmount
    );
    
    return this.getTransactionMessage("stake", args.token, formattedAmount);
  }

  /**
   * 🚀 Direct stake tokens (approve and stake in one go)
   */
  @CreateAction({
    schema: DirectStakeSchema,
    name: "directStake",
    description: "Approve and stake tokens in one operation",
  })
  async directStake(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof DirectStakeSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const tokenAddress = this.getTokenAddress(args.token as TreehouseToken);
    this.checkStakingEligibility(args.token as TreehouseToken);
    
    // Parse the amount to the appropriate token units
    const parsedAmount = await this.parseTokenAmount(
      walletProvider,
      tokenAddress,
      args.amount
    );
    
    // Check if the user has enough balance
    await this.checkTokenBalance(
      walletProvider,
      tokenAddress,
      parsedAmount.toString()
    );
    
    // Check allowance
    const address = await walletProvider.getAddress();
    const allowance = await walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address as `0x${string}`, ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`],
    }) as bigint;
    
    // If allowance is insufficient, send approval transaction first
    if (allowance < parsedAmount) {
      // Encode the approval function call
      const approvalData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`, parsedAmount],
      });
      
      // Send the approval transaction
      await walletProvider.sendTransaction({
        to: tokenAddress as `0x${string}`,
        data: approvalData as Hex,
      });
    }
    
    // Get the receiver address (default to caller if not specified)
    const receiver = args.receiver || address;
    
    // Encode the stake function call
    const stakeData = encodeFunctionData({
      abi: TREEHOUSE_STAKING_ABI,
      functionName: "deposit",
      args: [
        tokenAddress as `0x${string}`,
        parsedAmount,
        receiver as `0x${string}`,
      ],
    });
    
    // Send the staking transaction
    const txHash = await walletProvider.sendTransaction({
      to: ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`,
      data: stakeData as Hex,
    });
    
    // Format the amount for display
    const formattedAmount = await this.formatTokenAmount(
      walletProvider,
      tokenAddress,
      parsedAmount
    );
    
    return this.getTransactionMessage("approve and stake", args.token, formattedAmount);
  }

  /**
   * 📤 Withdraw staked tokens
   */
  @CreateAction({
    schema: WithdrawStakedSchema,
    name: "withdrawStaked",
    description: "Withdraw staked tokens from Treehouse Protocol",
  })
  async withdrawStaked(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof WithdrawStakedSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const tokenAddress = this.getTokenAddress(args.token as TreehouseToken);
    
    // Get the user's address
    const address = await walletProvider.getAddress();
    
    // Get the user's staked balance
    const stakedBalance = await this.getUserStakedBalance(
      walletProvider,
      address,
      tokenAddress
    );
    
    // Determine the amount to withdraw
    let amountToWithdraw: bigint;
    if (args.amount === "-1") {
      // Withdraw the entire staked balance
      amountToWithdraw = stakedBalance;
    } else {
      // Parse the amount to the appropriate token units
      amountToWithdraw = await this.parseTokenAmount(
        walletProvider,
        tokenAddress,
        args.amount
      );
    }
    
    // Check if the user has enough staked balance
    if (stakedBalance < amountToWithdraw) {
      const tokenSymbol = await this.getTokenSymbol(walletProvider, tokenAddress);
      const formattedStakedBalance = await this.formatTokenAmount(
        walletProvider,
        tokenAddress,
        stakedBalance
      );
      const formattedWithdrawAmount = await this.formatTokenAmount(
        walletProvider,
        tokenAddress,
        amountToWithdraw
      );
      
      throw new InsufficientStakedBalanceError(
        tokenSymbol,
        formattedStakedBalance,
        formattedWithdrawAmount
      );
    }
    
    // Get the receiver address (default to caller if not specified)
    const receiver = args.receiver || address;
    
    // Encode the withdraw function call
    const data = encodeFunctionData({
      abi: TREEHOUSE_STAKING_ABI,
      functionName: "withdraw",
      args: [
        tokenAddress as `0x${string}`,
        amountToWithdraw,
        receiver as `0x${string}`,
      ],
    });
    
    // Send the transaction
    const txHash = await walletProvider.sendTransaction({
      to: ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`,
      data: data as Hex,
    });
    
    // Format the amount for display
    const formattedAmount = await this.formatTokenAmount(
      walletProvider,
      tokenAddress,
      amountToWithdraw
    );
    
    return this.getTransactionMessage("withdraw", args.token, formattedAmount);
  }

  /**
   * 💼 Get user staking data
   */
  @CreateAction({
    schema: GetUserStakingDataSchema,
    name: "getUserStakingData",
    description: "Get user's staking data from Treehouse Protocol",
  })
  async getUserStakingData(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetUserStakingDataSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    // Get the address to check
    const address = args.address || await walletProvider.getAddress();
    
    // Get the staked balance for cmETH
    const tokenAddress = this.getTokenAddress(TreehouseToken.CM_ETH);
    const stakedBalance = await this.getUserStakedBalance(
      walletProvider,
      address,
      tokenAddress
    );
    
    // Format the staked balance
    const formattedStakedBalance = await this.formatTokenAmount(
      walletProvider,
      tokenAddress,
      stakedBalance
    );
    
    // Get token balance
    const tokenBalance = await walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    }) as bigint;
    
    // Format the token balance
    const formattedTokenBalance = await this.formatTokenAmount(
      walletProvider,
      tokenAddress,
      tokenBalance
    );
    
    // Create the user staking data summary
    return `
## 🌳 Treehouse Protocol Staking Summary

**Address**: ${address}

### cmETH
- 💰 Wallet Balance: ${formattedTokenBalance} cmETH
- 🥩 Staked Balance: ${formattedStakedBalance} cmETH
`;
  }

  /**
   * Check if the action provider supports the current network
   */
  supportsNetwork = (network: Network): boolean => {
    return network.chainId === ChainConstants.CHAIN_ID.toString();
  };

  /**
   * Approve cmETH tokens to be staked in Treehouse Protocol
   */
  async approveCmETH(amount: string): Promise<string> {
    try {
      // Get wallet address
      const walletAddress = await this.walletProvider.getAddress();
      console.log(`Using wallet address: ${walletAddress} on Mantle network`);

      // Format amount with correct decimals (18 for cmETH)
      const amountInWei = parseUnits(amount, 18);

      // Create approval transaction
      const tx = {
        to: ChainConstants.CMETH_TOKEN_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: [
            {
              inputs: [
                { name: "spender", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              name: "approve",
              outputs: [{ name: "", type: "bool" }],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "approve",
          args: [ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`, amountInWei],
        }),
      };
      
      console.log(`Sending approval transaction on Mantle network: approving ${amount} cmETH for Treehouse staking`);

      // Send transaction
      const txHash = await this.walletProvider.sendTransaction(tx);
      console.log(`Approval transaction sent on Mantle: ${txHash}`);

      return `I've requested approval for ${amount} cmETH tokens for the Treehouse Protocol. Please check your wallet to sign the approval transaction. Once approved, I can proceed with staking.`;
    } catch (error) {
      console.error("Error approving cmETH tokens for Treehouse Protocol:", error);
      throw new TreehouseError(`Failed to approve cmETH tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stake cmETH tokens in Treehouse Protocol
   */
  async stakeCmETH(amount: string): Promise<string> {
    try {
      // Get wallet address
      const walletAddress = await this.walletProvider.getAddress();
      console.log(`Using wallet address: ${walletAddress} on Mantle network`);

      // Check allowance
      const allowance = await this.getTokenAllowance(
        ChainConstants.CMETH_TOKEN_ADDRESS,
        ChainConstants.TREEHOUSE_STAKING_CONTRACT
      );

      // Parse amount
      const parsedAmount = parseFloat(amount);
      if (parseFloat(allowance) < parsedAmount) {
        throw new InsufficientAllowanceError(
          "cmETH",
          allowance,
          amount
        );
      }

      // Format amount with correct decimals
      const amountInWei = parseUnits(amount, 18);

      // Create staking transaction
      const tx = {
        to: ChainConstants.TREEHOUSE_STAKING_CONTRACT as `0x${string}`,
        data: encodeFunctionData({
          abi: [
            {
              inputs: [
                { name: "token", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              name: "deposit",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "deposit",
          args: [ChainConstants.CMETH_TOKEN_ADDRESS as `0x${string}`, amountInWei],
        }),
      };

      console.log(`Sending staking transaction on Mantle network: staking ${amount} cmETH in Treehouse Protocol`);

      // Send transaction
      const txHash = await this.walletProvider.sendTransaction(tx);
      console.log(`Staking transaction sent on Mantle: ${txHash}`);

      return `I've initiated the staking of ${amount} cmETH tokens in the Treehouse Protocol. Please check your wallet to sign the transaction. Your tokens will be staked once the transaction is confirmed.`;
    } catch (error) {
      console.error("Error staking cmETH tokens in Treehouse Protocol:", error);
      
      if (error instanceof InsufficientAllowanceError) {
        return error.message;
      }
      
      throw new TreehouseError(`Failed to stake cmETH tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const treehouseProtocolActionProvider = (walletProvider: WalletProvider) => new TreehouseProtocolActionProvider(walletProvider); 