// @ts-nocheck - Temporarily disable TypeScript checking for this file
import express from "express";

import cors from "cors";
import bodyParser from "body-parser";
import { HumanMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";
import { initializeAgent } from "./chatbot";
import { pendingTransactions, updateTransactionStatus, getTransactionById } from "./utils/transaction-utils";
import { startAtomicSwapRelay } from "./services/atomic-swap-relay";
import { updateSwapStatus, getMostRecentSwap } from "./action-providers/basic-atomic-swaps/utils";

dotenv.config();

// Store connected wallet address globally for use across requests
let connectedWalletAddress: string | null = null;
let selectedNetwork: string = "mantle"; // Default to Mantle network

// Cache agent instances by wallet address and network
const agentCache: Record<string, { agent: any, config: any, timestamp: number }> = {};
// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Get or create an agent for the current wallet address and network
 */
async function getOrCreateAgent(walletAddress: string | null, network: string = "base") {
  // Create a cache key - combines wallet address (or "default") and network
  const cacheKey = `${walletAddress || "default"}-${network}`;
  const now = Date.now();
  
  // Check if we have a cached agent and it's not expired
  if (
    agentCache[cacheKey] && 
    now - agentCache[cacheKey].timestamp < CACHE_EXPIRATION_MS
  ) {
    console.log(`Using cached agent for ${cacheKey}`);
    return {
      agent: agentCache[cacheKey].agent,
      config: agentCache[cacheKey].config
    };
  }
  
  // Initialize a new agent
  console.log(`Creating new agent for ${cacheKey}`);
  
  try {
    const { agent, config } = await initializeAgent({ 
      network: network, 
      nonInteractive: true,
      walletAddress: walletAddress
    });
    
    // Cache the new agent
    agentCache[cacheKey] = {
      agent,
      config,
      timestamp: now
    };
    
    return { agent, config };
  } catch (error) {
    console.error(`Failed to initialize agent for ${cacheKey}:`, error);
    
    // If we have an expired agent in cache, use it as fallback
    if (agentCache[cacheKey]) {
      console.log(`Using expired agent for ${cacheKey} as fallback`);
      return {
        agent: agentCache[cacheKey].agent,
        config: agentCache[cacheKey].config
      };
    }
    
    // Otherwise re-throw the error
    throw error;
  }
}

/**
 * Update any associated swap records when a transaction is confirmed
 * @param txId - The transaction ID
 * @param status - The new status
 * @param hash - The blockchain transaction hash
 */
function updateAssociatedSwapRecords(txId, status, hash) {
  if (status !== 'confirmed' || !hash) {
    return;
  }
  
  // Get the most recent swap (we'll expand this in the future to track all pending swaps)
  const recentSwap = getMostRecentSwap();
  if (!recentSwap) {
    return;
  }
  
  // Check if this swap has a transaction ID that matches our internal ID format
  if (recentSwap.sourceTxHash && recentSwap.sourceTxHash === txId) {
    console.log(`Updating swap record ${recentSwap.swapId} with blockchain transaction hash ${hash}`);
    updateSwapStatus(recentSwap.swapId, recentSwap.status, hash);
  }
}

/**
 * Check if the user explicitly mentioned a protocol that should be prioritized
 * @param userInput - The user's query text
 * @returns The appropriate network to use, or null if no specific protocol mentioned
 */
function detectProtocolNetwork(userInput: string): string | null {
  const lowerInput = userInput.toLowerCase();
  
  // Check for Mantle-specific protocols
  if (
    lowerInput.includes('merchant moe') || 
    lowerInput.includes('merchantmoe') ||
    lowerInput.includes('init capital') || 
    lowerInput.includes('initcapital') ||
    lowerInput.includes('treehouse protocol') ||
    lowerInput.includes('treehouse') ||
    lowerInput.includes('stake cmeth') ||
    lowerInput.includes('cmeth staking') ||
    lowerInput.includes('lendle protocol') ||
    lowerInput.includes('lendle') ||
    lowerInput.includes('deposit mnt') ||
    lowerInput.includes('supply mnt') ||
    lowerInput.includes('withdraw mnt') ||
    lowerInput.includes('deposit usdt to lendle') ||
    lowerInput.includes('supply usdt as collateral') ||
    lowerInput.includes('approve usdt for lendle') ||
    lowerInput.includes('check my lendle position') ||
    (lowerInput.includes('swap') && lowerInput.includes('mnt') && lowerInput.includes('mantle')) ||
    (lowerInput.includes('swap') && lowerInput.includes('usdt') && lowerInput.includes('mantle'))
  ) {
    console.log("Detected Mantle-specific protocol mention in user query");
    return "mantle";
  }
  
  // Check for Base-specific protocols
  if (
    lowerInput.includes('base bridge') ||
    lowerInput.includes('basebridge')
  ) {
    console.log("Detected Base-specific protocol mention in user query");
    return "base";
  }
  
  // Check for Arbitrum-specific protocols
  if (
    lowerInput.includes('arbitrum bridge') ||
    lowerInput.includes('arbitrumbridge')
  ) {
    console.log("Detected Arbitrum-specific protocol mention in user query");
    return "arbitrum";
  }
  
  // Check for zkSync-specific protocols
  if (
    lowerInput.includes('zksync bridge') ||
    lowerInput.includes('zksyncbridge')
  ) {
    console.log("Detected zkSync-specific protocol mention in user query");
    return "zksync";
  }
  
  return null;
}

/**
 * Create an Express server to expose the AI agent as an API
 */
async function createServer() {
  try {
    // Initialize the agent in non-interactive mode, automatically selecting Mantle
    console.log("🤖 Initializing AI agent for API...");
    const { agent: defaultAgent, config: defaultConfig } = await initializeAgent({ 
      network: "mantle", 
      nonInteractive: true 
    });
    console.log("✅ Agent initialization complete");
    
    // Start the atomic swap relay service
    const stopRelayService = startAtomicSwapRelay();
    
    // Initialize the default agent cache
    agentCache["default-mantle"] = {
      agent: defaultAgent,
      config: defaultConfig,
      timestamp: Date.now()
    };

    // Create Express app
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    // Wallet connection endpoint
    app.post("/api/wallet/connect", async (req, res) => {
      try {
        const { walletAddress, network = selectedNetwork } = req.body;
        
        if (!walletAddress) {
          return res.status(400).json({ 
            success: false, 
            message: 'No wallet address provided' 
          });
        }
        
        // Validate wallet address format
        if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid wallet address format. Must be a 0x-prefixed 20-byte hex string (40 characters after 0x)' 
          });
        }
        
        // Validate and set network
        if (!["base", "arbitrum", "mantle", "zksync"].includes(network)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid network. Must be one of: base, arbitrum, mantle, zksync'
          });
        }
        
        console.log(`✅ Wallet connected: ${walletAddress} on ${network}`);
        
        // Store the wallet address for future agent initializations
        connectedWalletAddress = walletAddress;
        
        // If a different network is requested, switch to it
        if (network !== selectedNetwork) {
          console.log(`Switching network from ${selectedNetwork} to ${network} for wallet connection`);
          selectedNetwork = network;
        }
        
        // Log the network being used (should be Mantle)
        console.log(`⚠️ Current selected network: ${selectedNetwork.toUpperCase()}`);
        
        // Ensure we're using Mantle for Treehouse Protocol transactions
        if (selectedNetwork !== 'mantle' && walletAddress) {
          console.log(`⚠️ Warning: Using ${selectedNetwork} network, but Treehouse Protocol requires Mantle network`);
        }
        
        // Pre-initialize an agent for this wallet address and network
        // Force a new agent creation by invalidating the cache
        const cacheKey = `${walletAddress}-${network}`;
        if (agentCache[cacheKey]) {
          delete agentCache[cacheKey];
        }
        
        try {
          await getOrCreateAgent(walletAddress, network);
          console.log(`✅ Successfully initialized agent for ${walletAddress} on ${network}`);
        } catch (agentError) {
          console.error(`Failed to initialize agent for ${walletAddress} on ${network}:`, agentError);
          return res.status(500).json({
            success: false,
            message: 'Failed to initialize agent for wallet. Please try again.'
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: `Wallet address received and stored for agent communication on ${network}`,
          network: network
        });
      } catch (error) {
        console.error('Error handling wallet connection:', error);
        return res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown server error' 
        });
      }
    });

    // Network selection endpoint
    app.post("/api/network/select", async (req, res) => {
      try {
        const { network } = req.body;
        
        if (!network) {
          return res.status(400).json({
            success: false,
            message: 'No network provided'
          });
        }
        
        // Validate network
        if (!["base", "arbitrum", "mantle", "zksync"].includes(network)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid network. Must be one of: base, arbitrum, mantle, zksync'
          });
        }
        
        console.log(`✅ Network changing from ${selectedNetwork} to: ${network}`);
        
        // If we're already on this network, just return success
        if (selectedNetwork === network) {
          return res.status(200).json({
            success: true,
            message: `Already on ${network} network`,
            previousNetwork: selectedNetwork,
            newNetwork: network
          });
        }
        
        // Store the previous network for reference
        const previousNetwork = selectedNetwork;
        // Update the network
        selectedNetwork = network;
        
        // Pre-initialize an agent for the current wallet on the new network
        // Force a new agent creation by invalidating the cache
        if (connectedWalletAddress) {
          const cacheKey = `${connectedWalletAddress}-${network}`;
          // Delete the cached agent if it exists
          if (agentCache[cacheKey]) {
            delete agentCache[cacheKey];
          }
          
          try {
            await getOrCreateAgent(connectedWalletAddress, network);
            console.log(`✅ Successfully initialized agent for ${connectedWalletAddress} on ${network}`);
          } catch (agentError) {
            console.error(`Failed to initialize agent for ${network}:`, agentError);
            // Even if agent initialization fails, we keep the network change
          }
        }
        
        return res.status(200).json({
          success: true,
          message: `Network changed to ${network}`,
          previousNetwork,
          newNetwork: network
        });
      } catch (error) {
        console.error('Error changing network:', error);
        return res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown server error' 
        });
      }
    });

    // Transaction handling endpoints
    
    // Get pending transactions
    app.get("/api/transactions/pending", (req, res) => {
      try {
        // Filter transactions that are in pending state
        const pending = pendingTransactions.filter(tx => tx.status === 'pending');
        
        return res.json({
          success: true,
          transactions: pending
        });
      } catch (error) {
        console.error('Error fetching pending transactions:', error);
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });
    
    // Update transaction status
    app.post("/api/transactions/:txId/update", (req, res) => {
      try {
        const { txId } = req.params;
        const { status, hash } = req.body;
        
        // Use the utility function instead of directly manipulating the array
        const updatedTx = updateTransactionStatus(txId, status, hash);
        
        if (!updatedTx) {
          return res.status(404).json({
            success: false,
            message: `Transaction with ID ${txId} not found`
          });
        }
        
        console.log(`Transaction ${txId} updated: status=${status}, hash=${hash || 'N/A'}`);
        
        // Update any associated atomic swap records with the real transaction hash
        updateAssociatedSwapRecords(txId, status, hash);
        
        return res.json({
          success: true,
          transaction: updatedTx
        });
      } catch (error) {
        console.error(`Error updating transaction:`, error);
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });

    // Define API routes
    app.post("/api/agent/chat", async (req, res) => {
      try {
        const { userInput } = req.body;
        
        if (!userInput || typeof userInput !== "string") {
          return res.status(400).json({ 
            error: "Invalid request. 'userInput' must be a non-empty string." 
          });
        }

        console.log(`🔍 Received query: "${userInput}"`);
        
        // Check if the user explicitly mentioned a protocol
        const protocolNetwork = detectProtocolNetwork(userInput);
        
        // Special handling for Treehouse Protocol queries
        if (userInput.toLowerCase().includes('cmeth') || 
            userInput.toLowerCase().includes('treehouse') || 
            userInput.toLowerCase().includes('staking on mantle')) {
          console.log(`⚠️ Detected Treehouse Protocol query, ensuring Mantle network is used`);
          
          if (selectedNetwork !== 'mantle') {
            console.log(`⚠️ Switching to Mantle network for Treehouse Protocol query`);
            selectedNetwork = 'mantle';
          }
        }
        
        // If user mentioned a specific protocol, prioritize that network
        if (protocolNetwork && protocolNetwork !== selectedNetwork) {
          console.log(`Detected protocol-specific request for ${protocolNetwork} network, but current network is ${selectedNetwork}`);
          console.log(`Advising user to switch to ${protocolNetwork} network for this request`);
          return res.json({ 
            response: `This action requires the ${protocolNetwork} network. Please switch networks using the dropdown in the header.` 
          });
        }
        
        // Get agent for the current wallet address and network
        let { agent, config } = await getOrCreateAgent(connectedWalletAddress, selectedNetwork);
        
        let finalResponse = "";
        // Use streaming for real-time updates
        const stream = await agent.stream(
          { messages: [new HumanMessage(userInput)] },
          config
        );
        
        for await (const chunk of stream) {
          if ("agent" in chunk) {
            finalResponse = chunk.agent.messages[0].content;
          }
        }
        
        console.log(`✅ Response sent (${finalResponse.length} chars)`);
        return res.json({ response: finalResponse });
      } catch (err: any) {
        console.error("🚨 Error in /api/agent/chat:", err);
        return res.status(500).json({ error: err.message || "Unknown error occurred" });
      }
    });

    // Health check endpoint
    app.get("/api/health", (_, res) => {
      return res.json({ 
        status: "ok", 
        service: "MictlAI API",
        walletConnected: connectedWalletAddress ? true : false,
        network: selectedNetwork,
        supportedNetworks: ["base", "arbitrum", "mantle", "zksync"]
      });
    });

    // Start the server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 MictlAItecuhtli API server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Chat endpoint: http://localhost:${PORT}/api/agent/chat`);
      console.log(`🔗 Wallet connection: http://localhost:${PORT}/api/wallet/connect`);
      console.log(`🔗 Network selection: http://localhost:${PORT}/api/network/select`);
      console.log(`🔗 Pending transactions: http://localhost:${PORT}/api/transactions/pending`);
      console.log(`🌐 Current network: ${selectedNetwork.toUpperCase()}`);
      
      // Verify we're on Mantle network
      if (selectedNetwork !== 'mantle') {
        console.warn(`⚠️ WARNING: Running on ${selectedNetwork} network, but Mantle is the default. Use /api/network/select to switch.`);
      } else {
        console.log(`✅ Correctly running on Mantle network`);
      }
    });
  } catch (error) {
    console.error("🚨 Failed to start API server:", error);
    process.exit(1);
  }
}

// Start the server
createServer(); 