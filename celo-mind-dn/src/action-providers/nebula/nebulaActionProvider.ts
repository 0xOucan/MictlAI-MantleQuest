import { z } from "zod";
import {
  ActionProvider,
  Network,
  CreateAction,
  EvmWalletProvider,
  WalletProvider,
} from "@coinbase/agentkit";
import { createThirdwebClient } from "thirdweb";
import "reflect-metadata";
import {
  NebulaChatSchema,
  NebulaExecuteSchema,
  NebulaQuerySchema,
  NebulaReasonSchema,
  NebulaAssistSchema,
  type NebulaChatInput,
  type NebulaExecuteInput,
  type NebulaQueryInput,
  type NebulaReasonInput,
  type NebulaAssistInput,
} from "./schemas";
import { NebulaConstants, NEBULA_ICONS, NEBULA_HEADERS } from "./constants";
import {
  NebulaError,
  NebulaConfigurationError,
  NebulaNetworkError,
  NebulaAPIError,
  NebulaResponseError,
  NebulaExecutionError,
  NebulaUnsupportedChainError,
  NebulaTimeoutError,
  createNebulaErrorFromResponse,
  isNebulaError,
} from "./errors";
import { createPendingTransaction } from "../../utils/transaction-utils";

/**
 * 🤖 NebulaActionProvider integrates thirdweb's Nebula AI for natural language blockchain interactions
 * Focused on Mantle network for enhanced DeFi and token operations
 */
export class NebulaActionProvider extends ActionProvider<EvmWalletProvider> {
  private walletProvider: EvmWalletProvider;
  private secretKey: string;
  private thirdwebClient: any;
  private sessionCache: Map<string, any> = new Map();

  constructor(walletProvider: WalletProvider) {
    super("nebula-ai", []);
    this.walletProvider = walletProvider as EvmWalletProvider;
    
    // Get secret key from environment
    this.secretKey = process.env.YOUR_THIRDWEB_SECRET_KEY || "";
    if (!this.secretKey) {
      throw new NebulaConfigurationError("YOUR_THIRDWEB_SECRET_KEY environment variable is required");
    }
    
    // Initialize thirdweb client
    this.thirdwebClient = createThirdwebClient({
      secretKey: this.secretKey,
    });
    
    console.log("🤖 NebulaActionProvider initialized for Mantle network with thirdweb integration");
  }

  /**
   * 🌐 Check if we're on supported network (Mantle)
   */
  private async checkNetwork(): Promise<void> {
    const network = await this.walletProvider.getNetwork();
    const chainId = parseInt(network.chainId || "0");
    
    if (chainId !== NebulaConstants.CHAIN_ID) {
      throw new NebulaUnsupportedChainError(chainId, NebulaConstants.CHAIN_ID);
    }
  }

  /**
   * 🌐 Make HTTP request to Nebula API with proper error handling using thirdweb SDK
   */
  private async makeNebulaRequest(
    endpoint: string,
    body: any,
    options: { timeout?: number } = {}
  ): Promise<any> {
    const url = `${NebulaConstants.BASE_URL}${endpoint}`;
    const timeout = options.timeout || NebulaConstants.DEFAULT_TIMEOUT;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`🤖 Making Nebula API request to ${endpoint}`);
      console.log(`📤 Request body:`, JSON.stringify(body, null, 2));
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": this.secretKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        let responseBody;
        try {
          responseBody = await response.json();
        } catch {
          responseBody = await response.text();
        }
        console.log(`❌ Error response:`, responseBody);
        throw createNebulaErrorFromResponse(response, responseBody);
      }

      const data = await response.json();
      console.log(`✅ Nebula API response received successfully`);
      console.log(`📥 Response data:`, JSON.stringify(data, null, 2));
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === "AbortError") {
        throw new NebulaTimeoutError(timeout);
      }
      
      if (isNebulaError(error)) {
        throw error;
      }
      
      // Network or other errors
      console.error(`❌ Network error:`, error);
      throw new NebulaNetworkError(
        `Failed to connect to Nebula API: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 💬 Chat with Nebula AI using natural language
   */
  @CreateAction({
    schema: NebulaChatSchema,
    name: "chatWithNebula",
    description: "Chat with Nebula AI using natural language for blockchain operations on Mantle",
  })
  async chatWithNebula(
    walletProvider: EvmWalletProvider,
    args: NebulaChatInput
  ): Promise<string> {
    console.log(`🚀 NEBULA ACTION TRIGGERED: chatWithNebula called with message: "${args.message}"`);
    await this.checkNetwork();

    try {
      // Get wallet address for context
      const walletAddress = args.contextWalletAddress || await this.walletProvider.getAddress();
      
      console.log(`${NEBULA_ICONS.CHAT} Processing Nebula chat request: "${args.message}"`);
      console.log(`🔑 Using secret key: ${this.secretKey.substring(0, 10)}...`);
      
      // Prepare request body with correct thirdweb API format
      const requestBody = {
        message: args.message,
        context_filter: {
          chains: [{ id: NebulaConstants.CHAIN_ID, name: NebulaConstants.CHAIN_NAME }],
          wallet_addresses: [walletAddress],
        },
        execute_config: {
          mode: "client",
          signer_wallet_address: walletAddress,
        },
        stream: NebulaConstants.STREAM,
      };

      console.log(`📤 Sending request to Nebula API:`, JSON.stringify(requestBody, null, 2));

      // Make API request
      const response = await this.makeNebulaRequest(
        NebulaConstants.CHAT_ENDPOINT,
        requestBody
      );

      console.log(`📥 Received response from Nebula API:`, JSON.stringify(response, null, 2));

      if (!response) {
        throw new NebulaResponseError("Empty response from Nebula API");
      }

      // Cache session if provided
      if (response.session_id) {
        this.sessionCache.set(response.session_id, {
          timestamp: Date.now(),
          walletAddress,
          response,
        });
        console.log(`📝 Cached Nebula session: ${response.session_id}`);
      }

      // Extract and format response
      let formattedResponse = `${NEBULA_ICONS.CHAT} **Nebula AI Response:**\n\n`;
      
      if (response.message) {
        formattedResponse += response.message;
      } else if (response.content) {
        formattedResponse += response.content;
      } else {
        formattedResponse += "Nebula processed your request successfully.";
      }

      // Handle actions/transactions if present
      if (args.includeTransactions && response.actions && response.actions.length > 0) {
        formattedResponse += `\n\n${NEBULA_ICONS.EXECUTE} **Available Actions:**\n`;
        
        response.actions.forEach((action: any, index: number) => {
          formattedResponse += `${index + 1}. ${action.description || action.type || 'Blockchain Action'}\n`;
          
          // Create pending transaction for each action
          if (action.data && walletAddress) {
            try {
              const actionData = typeof action.data === 'string' ? JSON.parse(action.data) : action.data;
              
              createPendingTransaction(
                actionData.to || action.to,
                actionData.value || action.value || "0",
                actionData.data || action.data,
                walletAddress,
                {
                  chain: 'mantle',
                  dataType: 'nebula-transaction',
                  sessionId: response.session_id,
                  transactionIndex: index,
                  description: action.description || action.type,
                }
              );
            } catch (error) {
              console.error(`Error creating pending transaction for action ${index}:`, error);
            }
          }
        });
        
        if (response.session_id) {
          formattedResponse += `\nUse session ID \`${response.session_id}\` to execute these transactions.`;
        }
      }

      return formattedResponse;

    } catch (error) {
      console.error(`❌ Error in Nebula chat:`, error);
      
      if (isNebulaError(error)) {
        return `${NEBULA_ICONS.CHAT} **Nebula Error:** ${error.message}`;
      }
      
      return `${NEBULA_ICONS.CHAT} **Error:** Failed to process request with Nebula AI: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * ⚡ Execute transactions from Nebula session
   */
  @CreateAction({
    schema: NebulaExecuteSchema,
    name: "executeNebulaTransactions",
    description: "Execute transactions returned by Nebula AI",
  })
  async executeNebulaTransactions(
    walletProvider: EvmWalletProvider,
    args: NebulaExecuteInput
  ): Promise<string> {
    await this.checkNetwork();

    try {
      console.log(`${NEBULA_ICONS.EXECUTE} Executing Nebula transactions for session: ${args.sessionId}`);

      // Check if session exists in cache
      const cachedSession = this.sessionCache.get(args.sessionId);
      if (!cachedSession) {
        throw new NebulaError(`Session ${args.sessionId} not found or expired`);
      }

      // Prepare execution request
      const requestBody = {
        sessionId: args.sessionId,
        walletAddress: args.walletAddress,
        executeAll: args.executeAll,
        transactionIndex: args.transactionIndex,
        contextFilter: {
          chains: [NebulaConstants.SUPPORTED_CHAIN],
        },
      };

      // Make execute API request
      const response = await this.makeNebulaRequest(
        NebulaConstants.EXECUTE_ENDPOINT,
        requestBody
      );

      if (!response) {
        throw new NebulaResponseError("Empty response from Nebula execute API");
      }

      let resultMessage = `${NEBULA_ICONS.EXECUTE} **Transaction Execution Results:**\n\n`;

      // Handle successful executions
      if (response.executedTransactions && response.executedTransactions.length > 0) {
        response.executedTransactions.forEach((tx: any, index: number) => {
          resultMessage += `${index + 1}. ${tx.status === 'success' ? '✅' : '❌'} ${tx.description || 'Transaction'}\n`;
          if (tx.hash) {
            resultMessage += `   Hash: \`${tx.hash}\`\n`;
          }
          if (tx.error) {
            resultMessage += `   Error: ${tx.error}\n`;
          }
        });
      }

      // Handle any errors
      if (response.errors && response.errors.length > 0) {
        resultMessage += `\n**Errors:**\n`;
        response.errors.forEach((error: any, index: number) => {
          resultMessage += `${index + 1}. ${error.message || error}\n`;
        });
      }

      return resultMessage;

    } catch (error) {
      console.error(`❌ Error executing Nebula transactions:`, error);
      
      if (isNebulaError(error)) {
        return `${NEBULA_ICONS.EXECUTE} **Execution Error:** ${error.message}`;
      }
      
      return `${NEBULA_ICONS.EXECUTE} **Error:** Failed to execute transactions: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * 📖 Query blockchain data through Nebula
   */
  @CreateAction({
    schema: NebulaQuerySchema,
    name: "queryWithNebula",
    description: "Query blockchain data using natural language through Nebula AI",
  })
  async queryWithNebula(
    walletProvider: EvmWalletProvider,
    args: NebulaQueryInput
  ): Promise<string> {
    await this.checkNetwork();

    try {
      console.log(`${NEBULA_ICONS.READ} Processing Nebula data query: "${args.query}"`);

      // Prepare context filters
      const contextFilter: any = {
        chains: [NebulaConstants.SUPPORTED_CHAIN],
      };

      if (args.targetAddress) {
        contextFilter.walletAddresses = [args.targetAddress];
      }

      if (args.tokenAddress) {
        contextFilter.contractAddresses = [args.tokenAddress];
      }

      const requestBody = {
        message: `Query blockchain data: ${args.query}`,
        contextFilter,
        stream: NebulaConstants.STREAM,
      };

      const response = await this.makeNebulaRequest(
        NebulaConstants.CHAT_ENDPOINT,
        requestBody
      );

      if (!response || !response.message) {
        throw new NebulaResponseError("No data returned from Nebula query");
      }

      return `${NEBULA_ICONS.READ} **Blockchain Data Query Results:**\n\n${response.message}`;

    } catch (error) {
      console.error(`❌ Error in Nebula query:`, error);
      
      if (isNebulaError(error)) {
        return `${NEBULA_ICONS.READ} **Query Error:** ${error.message}`;
      }
      
      return `${NEBULA_ICONS.READ} **Error:** Failed to query blockchain data: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * 🧠 Ask Nebula to reason about blockchain data
   */
  @CreateAction({
    schema: NebulaReasonSchema,
    name: "reasonWithNebula",
    description: "Ask Nebula AI to analyze and explain blockchain data or transactions",
  })
  async reasonWithNebula(
    walletProvider: EvmWalletProvider,
    args: NebulaReasonInput
  ): Promise<string> {
    await this.checkNetwork();

    try {
      console.log(`${NEBULA_ICONS.REASON} Processing Nebula reasoning request for: "${args.subject}"`);

      const message = `Analyze and explain: ${args.subject}. Question: ${args.question}${
        args.includeRecommendations ? " Please include actionable recommendations." : ""
      }`;

      const requestBody = {
        message,
        contextFilter: {
          chains: [NebulaConstants.SUPPORTED_CHAIN],
        },
        stream: NebulaConstants.STREAM,
      };

      const response = await this.makeNebulaRequest(
        NebulaConstants.CHAT_ENDPOINT,
        requestBody
      );

      if (!response || !response.message) {
        throw new NebulaResponseError("No analysis returned from Nebula");
      }

      return `${NEBULA_ICONS.REASON} **Nebula Analysis:**\n\n${response.message}`;

    } catch (error) {
      console.error(`❌ Error in Nebula reasoning:`, error);
      
      if (isNebulaError(error)) {
        return `${NEBULA_ICONS.REASON} **Analysis Error:** ${error.message}`;
      }
      
      return `${NEBULA_ICONS.REASON} **Error:** Failed to analyze with Nebula: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * 🎯 General AI assistance for blockchain operations
   */
  @CreateAction({
    schema: NebulaAssistSchema,
    name: "assistWithNebula",
    description: "Get AI assistance for blockchain operations and DeFi strategies on Mantle",
  })
  async assistWithNebula(
    walletProvider: EvmWalletProvider,
    args: NebulaAssistInput
  ): Promise<string> {
    await this.checkNetwork();

    try {
      console.log(`${NEBULA_ICONS.CHAT} Processing Nebula assistance request`);

      // Get wallet address for context if provided
      const walletAddress = args.userAddress || await this.walletProvider.getAddress();

      const contextFilter: any = {
        chains: [NebulaConstants.SUPPORTED_CHAIN],
        walletAddresses: [walletAddress],
      };

      const requestBody = {
        message: args.request,
        contextFilter,
        stream: NebulaConstants.STREAM,
      };

      const response = await this.makeNebulaRequest(
        NebulaConstants.CHAT_ENDPOINT,
        requestBody
      );

      if (!response) {
        throw new NebulaResponseError("No assistance provided by Nebula");
      }

      let assistanceMessage = `${NEBULA_ICONS.CHAT} **Nebula AI Assistance:**\n\n`;
      
      if (response.message) {
        assistanceMessage += response.message;
      }

      // Handle transactions for high priority or expected transaction requests
      if ((args.priority === "high" || args.expectTransactions) && 
          response.transactions && response.transactions.length > 0) {
        
        assistanceMessage += `\n\n${NEBULA_ICONS.EXECUTE} **Suggested Actions:**\n`;
        
        response.transactions.forEach((tx: any, index: number) => {
          assistanceMessage += `${index + 1}. ${tx.description || 'Blockchain Action'}\n`;
          
          if (tx.to && walletAddress) {
            createPendingTransaction(
              tx.to,
              tx.value || "0",
              tx.data,
              walletAddress,
              {
                chain: 'mantle',
                dataType: 'nebula-assistance',
                sessionId: response.sessionId,
                transactionIndex: index,
                priority: args.priority,
              }
            );
          }
        });
      }

      return assistanceMessage;

    } catch (error) {
      console.error(`❌ Error in Nebula assistance:`, error);
      
      if (isNebulaError(error)) {
        return `${NEBULA_ICONS.CHAT} **Assistance Error:** ${error.message}`;
      }
      
      return `${NEBULA_ICONS.CHAT} **Error:** Failed to get assistance from Nebula: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * 🌟 Force Nebula AI usage for testing - this action is specifically triggered by "nebula" keywords
   */
  @CreateAction({
    schema: z.object({
      query: z.string().describe("The query to send to Nebula AI"),
    }),
    name: "forceNebulaChat",
    description: "Force Nebula AI to process a query when user explicitly mentions 'nebula' - this ensures Nebula AI is used instead of regular actions",
  })
  async forceNebulaChat(
    walletProvider: EvmWalletProvider,
    args: { query: string }
  ): Promise<string> {
    console.log(`🚀 FORCE NEBULA ACTION TRIGGERED: forceNebulaChat called with query: "${args.query}"`);
    
    return await this.chatWithNebula(walletProvider, {
      message: args.query,
      includeTransactions: true,
    });
  }

  /**
   * Check if the action provider supports the current network
   */
  supportsNetwork = (network: Network): boolean => {
    return network.chainId === NebulaConstants.CHAIN_ID.toString();
  };

  /**
   * 🧹 Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessionCache.entries()) {
      if (now - session.timestamp > maxAge) {
        this.sessionCache.delete(sessionId);
        console.log(`🧹 Cleaned up expired Nebula session: ${sessionId}`);
      }
    }
  }

  /**
   * 📊 Get provider statistics
   */
  getStats(): {
    activeSessions: number;
    supportedChain: string;
    configurationStatus: string;
  } {
    this.cleanupExpiredSessions();
    
    return {
      activeSessions: this.sessionCache.size,
      supportedChain: `${NebulaConstants.CHAIN_NAME} (${NebulaConstants.CHAIN_ID})`,
      configurationStatus: this.secretKey ? "Configured" : "Missing Secret Key",
    };
  }
}

export const nebulaActionProvider = (walletProvider: WalletProvider) => new NebulaActionProvider(walletProvider); 