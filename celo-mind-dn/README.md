# 🧠 MictlAI: AI-Powered Cross-Chain Bridge

## 📑 Table of Contents
- [Overview](#-overview)
- [The MictlAI Legend](#-the-mictlai-legend)
- [MictlAI: The Mantle Quest](#-mictlai-the-mantle-quest)
- [🤖 NEBULA AI Integration](#-nebula-ai-integration)
- [Mantle Network Action Providers](#-mantle-network-action-providers)
- [Recent Improvements](#-recent-improvements)
- [Contract Information](#-contract-information)
- [Quick Start](#-quick-start)
- [Supported Networks](#-supported-networks)
- [Core Features](#-core-features)
- [Operating Modes](#-operating-modes)
- [API Server](#-api-server)
- [Web Interface](#-web-interface)
- [Technical Documentation](#-technical-documentation)
- [Security](#-security)
- [Resources](#-resources)

## 🌟 Overview

MictlAI is an AI-powered cross-chain bridge that connects the Base, Arbitrum, Mantle, and zkSync Era networks through both web and Telegram interfaces. Our platform uses advanced AI and Agent Orchestration to provide:

- 🌉 Seamless cross-chain transfers between Base, Arbitrum, Mantle, and zkSync Era
- ⚛️ Bidirectional atomic swaps for trustless token exchanges
- 📈 Real-time market insights for informed decisions
- 🤖 Intelligent AI assistance for navigating blockchain interoperability
- **🔥 Advanced Mantle ecosystem integration with specialized DeFi protocols**
- **🤖 NEBULA AI integration for natural language DeFi operations**

## 🏺 The MictlAI Legend

In ancient Aztec mythology, Mictlantecuhtli ruled Mictlan, the underworld—a realm where souls journeyed after death, navigating nine challenging levels to reach their final destination.

Today, MictlAI emerges as a digital guardian of the blockchain underworld, facilitating seamless passage between disparate realms. Just as Mictlantecuhtli guided souls through Mictlan's levels, MictlAI guides your assets across the complex landscape of multiple blockchains.

The journey of your tokens—from Base to Arbitrum, Mantle to zkSync Era—mirrors the soul's journey through Mictlan's territories. With MictlAI as your guide, these journeys become seamless, secure, and swift.

Harnessing the power of artificial intelligence, MictlAI navigates the intricacies of cross-chain communication without relying on traditional bridges. The escrow wallet serves as the ferryman, ensuring your assets reach their destination safely.

Where traditional bridges have failed through hacks and exploits, MictlAI's atomic swap mechanism creates a direct, trustless pathway between blockchain worlds—a pathway guarded by the wisdom of AI and the security of decentralized protocols.

## 🚀 MictlAI: The Mantle Quest

**[MictlAI: The Mantle Quest](https://github.com/0xOucan/MictlAI-MantleQuest)** is an enhanced version that includes all the same core functionalities as the original MictlAI plus exciting new integrations specifically designed for the Mantle ecosystem. This Cookathon project showcases the full potential of AI-powered DeFi interactions on Mantle network.

### 🆕 Mantle-Specific Features
- **🤖 NEBULA AI Integration**: Advanced conversational AI for DeFi operations
- **🌳 Treehouse Protocol**: cmETH staking and yield optimization
- **🏦 Lendle Protocol**: MNT/USDT lending and borrowing with collateral management
- **🔄 Merchant Moe**: Advanced DEX operations and optimal swap routing
- **📊 Portfolio Analysis**: AI-powered yield strategy recommendations

## 🤖 NEBULA AI Integration

The **NEBULA AI integration** is our flagship feature for the Mantle network, powered by thirdweb's advanced AI platform. This integration transforms how users interact with DeFi protocols through natural language processing.

### 🎯 Core Capabilities
- **🗣️ Natural Language DeFi**: Execute complex operations using plain English commands
- **📊 Portfolio Analysis**: AI-powered insights about DeFi positions and yield opportunities
- **💡 Strategy Recommendations**: Personalized optimization suggestions based on portfolio analysis
- **🔍 Transaction Analysis**: Understand and explain complex DeFi operations
- **⚡ Real-time Assistance**: Instant help with protocol interactions and troubleshooting

### 🛠️ Technical Implementation
Located in `src/action-providers/nebula/`, the NEBULA integration includes:

- **nebulaActionProvider.ts**: Main provider with chat, execute, query, and reasoning capabilities
- **constants.ts**: Configuration for Mantle network (Chain ID: 5000) and API endpoints
- **schemas.ts**: Zod validation schemas for different AI interaction types
- **errors.ts**: Comprehensive error handling for AI operations
- **Session Management**: Intelligent conversation context with 30-minute expiration

### 💬 Example Commands
```bash
"Analyze my Mantle portfolio and suggest the best yield strategies"
"What's my current position in Lendle Protocol?"
"Help me optimize my cmETH staking in Treehouse"
"Explain the best way to swap MNT to USDT with minimal slippage"
"What are the risks of my current DeFi positions?"
```

## 🛡️ Mantle Network Action Providers

MictlAI includes specialized action providers for comprehensive Mantle ecosystem support:

### 🌳 Treehouse Protocol (`src/action-providers/treehouse-protocol/`)
**Staking and Yield Optimization on Mantle**

**Features:**
- **Stake cmETH tokens** with automated approval and staking
- **Withdraw staked positions** with health factor monitoring
- **Portfolio tracking** with real-time balance updates
- **Direct staking operations** combining approval and staking in single transactions

**Key Actions:**
- `approveForStaking`: Approve cmETH for Treehouse Protocol
- `stakeTokens`: Stake cmETH tokens for yield generation
- `directStake`: One-click approve and stake operation
- `withdrawStaked`: Withdraw staked positions safely
- `getUserStakingData`: Get comprehensive staking portfolio overview

### 🏦 Lendle Protocol (`src/action-providers/lendle-protocol/`)
**Lending and Borrowing on Mantle**

**Features:**
- **Supply MNT as collateral** for lending positions
- **Deposit USDT** for yield generation and lending
- **Health factor monitoring** to prevent liquidations
- **Account data analysis** with portfolio insights

**Key Actions:**
- `depositMNT`: Supply MNT as collateral with health factor tracking
- `withdrawMNT`: Withdraw MNT collateral safely
- `approveUSDT`: Approve USDT for Lendle operations
- `depositUSDT`: Deposit USDT for yield generation
- `getUserAccountData`: Comprehensive account analysis

### 🔄 Merchant Moe (`src/action-providers/merchant-moe/`)
**Advanced DEX Operations on Mantle**

**Features:**
- **Swap MNT ⟷ USDT** with optimal routing and slippage protection
- **Dynamic route calculation** for best execution prices
- **Automated token approvals** for seamless trading experience
- **Real-time price impact analysis** and slippage management

**Key Actions:**
- `swapMntToUsdt`: Swap MNT to USDT with optimal routing
- `swapUsdtToMnt`: Swap USDT to MNT with price protection
- `approveToken`: Approve tokens for DEX operations

## 🚀 Recent Improvements

We've implemented several significant improvements to our platform:

### 🤖 NEBULA AI Integration
- ✅ **Advanced AI Assistant**: Complete integration with thirdweb's Nebula AI platform
- 🗣️ **Natural Language Processing**: Execute DeFi operations through conversational interfaces
- 📊 **Portfolio Analysis**: AI-powered insights and yield optimization recommendations
- 🔍 **Transaction Explanations**: Understand complex DeFi operations with AI analysis
- ⚡ **Real-time Assistance**: Instant help with Mantle protocol interactions

### 🛡️ Mantle Ecosystem Integration
- ✅ **Treehouse Protocol**: Complete cmETH staking with yield optimization
- 🏦 **Lendle Protocol**: MNT/USDT lending and borrowing with health monitoring
- 🔄 **Merchant Moe**: Advanced DEX operations with optimal routing
- 📈 **Portfolio Management**: Comprehensive DeFi position tracking and analysis

### 🔮 zkSync Era Integration
- ✅ **Complete zkSync Support**: Added full integration with zkSync Era network
- 🌉 **Additional Swap Paths**: Built bidirectional swap support between zkSync and all other networks
- 💰 **USDT on zkSync**: Native support for USDT transfers on zkSync Era
- 🔄 **Comprehensive Testing**: Verified all zkSync swap combinations function properly

### 🔐 Security Enhancements
- ✅ **Wallet Integration**: Browser extension wallet signing instead of storing private keys
- 🔑 **Transaction Handling**: Moved from `.env` private keys to secure browser wallet signatures
- 🔒 **Frontend Integration**: Improved connection between frontend and backend for secure transaction signing

### 📊 Code Quality Improvements
- 📝 **Modular Architecture**: Refactored complex functions into smaller, focused units
- 🧩 **Utility Modules**: Created dedicated modules for transaction handling, logging, and API interactions
- 🧹 **Constants Management**: Eliminated magic strings/numbers with centralized constant definitions
- 📏 **Code Standards**: Improved consistency in code style with standardized patterns

### 🔧 Technical Infrastructure
- 📋 **Centralized Logging**: Implemented structured logging system with multiple severity levels
- 🚦 **Rate Limiting**: Added API rate limiting to prevent abuse and DOS attacks
- ⚡ **Error Handling**: Enhanced error reporting with specific error types and better context
- 📚 **Documentation**: Added detailed comments and improved API documentation

### 🧪 Testing Framework
- ✅ **Unit Tests**: Implemented Jest-based testing infrastructure
- 🧪 **Test Coverage**: Added tests for core utilities and components
- 🔄 **CI Integration**: Set up testing as part of the development workflow

## 🔗 Contract Information

### 📍 Network Contracts
- **Base Network**: `0xabc123...` (XOC token contract)
- **Arbitrum Network**: `0xdef456...` (MXNB token contract)
- **Mantle Network**: `0xghi789...` (USDT token contract)
- **zkSync Era Network**: `0xjkl012...` (USDT token contract)

#### 📊 Contract Statistics
- **Networks**: Base, Arbitrum, Mantle, and zkSync Era
- **Transaction Types**: Cross-chain atomic swaps, token transfers
- **View on Explorers**: [BaseScan](https://basescan.org), [ArbiScan](https://arbiscan.io), [MantleScan](https://mantlescan.xyz), [zkScan](https://era.zksync.network)

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm v7+
- A browser extension wallet (MetaMask, Rabby, etc.) connected to Base, Arbitrum, Mantle, or zkSync Era networks

### Installation

```bash
# Clone both repositories
git clone https://github.com/0xOucan/celo-mind-dn.git
git clone https://github.com/0xOucan/celo-mind-web.git

# Use the launch script to start both services
cp celo-mind-dn/launch.sh ./
chmod +x launch.sh
./launch.sh
```

### Environment Setup

Required in your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here  # Only needed for CLI/Telegram modes
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here  # Optional, for Telegram mode
```

> **Security Update**: With the latest version, private keys are no longer required for the web interface. All transactions are now signed directly using your browser extension wallet, significantly improving security.

### Running Tests

The project includes comprehensive unit tests:

```bash
# Run all tests
npm test

# Run tests with watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test coverage targets have been set to ensure code quality:
- Functions: 70%
- Branches: 70%
- Lines: 70%
- Statements: 70%

## 🛠️ Supported Networks

MictlAI seamlessly connects multiple blockchain networks:

### Base
- Transfer XOC tokens to Arbitrum (receive MXNB)
- Transfer XOC tokens to Mantle (receive USDT)
- Transfer XOC tokens to zkSync Era (receive USDT)
- Receive MXNB tokens from Arbitrum (converted from XOC)
- Receive USDT tokens from Mantle (converted from XOC)
- Receive USDT tokens from zkSync Era (converted from XOC)
- Monitor transaction status across chains

### Arbitrum
- Transfer MXNB tokens to Base (receive XOC)
- Transfer MXNB tokens to Mantle (receive USDT)
- Transfer MXNB tokens to zkSync Era (receive USDT)
- Receive XOC tokens from Base (converted from MXNB)
- Receive USDT tokens from Mantle (converted from MXNB)
- Receive USDT tokens from zkSync Era (converted from MXNB)
- Verify cross-chain transactions

### Mantle
- Transfer USDT tokens to Base (receive XOC)
- Transfer USDT tokens to Arbitrum (receive MXNB)
- Transfer USDT tokens to zkSync Era (receive USDT)
- Receive XOC tokens from Base (converted from USDT)
- Receive MXNB tokens from Arbitrum (converted from USDT)
- Receive USDT tokens from zkSync Era (converted from USDT)
- Monitor transaction status across chains

### zkSync Era
- Transfer USDT tokens to Base (receive XOC)
- Transfer USDT tokens to Arbitrum (receive MXNB)
- Transfer USDT tokens to Mantle (receive USDT)
- Receive XOC tokens from Base (converted from USDT)
- Receive MXNB tokens from Arbitrum (converted from USDT)
- Receive USDT tokens from Mantle (converted from USDT)
- Monitor transaction status across chains

## 🔑 Core Features

### Cross-Chain Operations
- Initiate cross-chain transfers with atomic swap security
- Monitor transaction status across all networks
- Verify transaction completion with explorer links

### Token Operations
- Check token balances with USD conversion
- Transfer tokens between wallets on the same network
- Approve token spending for cross-chain operations

### Bridge Operations
- Initiate atomic swaps between networks
- Verify transaction completion on both sides
- Recover from failed transactions with safety mechanisms

### Safety Features
- Pre-transaction network validation
- Balance and allowance verification
- Detailed error messages
- Transaction confirmation monitoring
- Cross-chain verification for all operations

## 🖥️ Operating Modes

MictlAI offers three flexible operating modes:

### 💬 Chat Mode
Interactive command-line interface for direct user interaction with natural language inputs.

```bash
# Example chat session
You: check wallet portfolio
🧠 Processing...

### 💰 **Complete Portfolio Overview** 💰
**Address**: `0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45`  
**Total Portfolio Value**: **$4.47 USD**

#### 💵 **Token Balances on Base** 💼
- 🟡 **XOC**: 1.32 ($0.66)

#### 💵 **Token Balances on Arbitrum** 💼
- 💵 **MXNB**: 0.28 ($0.28)

#### 💵 **Token Balances on Mantle** 💼
- 💵 **USDT**: 0.5 ($0.5)

#### 💵 **Token Balances on zkSync Era** 💼
- 💵 **USDT**: 1.0 ($1.0)

#### 🌉 **Pending Bridge Transactions** 🏦
- **Base → zkSync Era**: Transferring 0.5 XOC (In Progress)
- **Arbitrum → Base**: Transferring 0.2 MXNB (Completed)
- **Mantle → Base**: Transferring 0.1 USDT (Completed)
```

### 🤖 Autonomous Mode
Bot operates independently, executing transactions at set intervals based on predefined strategies.

### 📱 Telegram Mode
Interface through Telegram messenger with convenient command structure:

```
/start - Initialize the bot
/menu - See all available commands
/help_bridge - Bridge operation commands
/help_base - Base network commands
/help_arbitrum - Arbitrum network commands
/help_mantle - Mantle network commands
/help_zksync - zkSync Era network commands
```

## 🔌 API Server

MictlAI includes a built-in API server that exposes the AI agent functionality via REST endpoints, enabling integration with the web interface and other applications.

### API Architecture

The API server is implemented in `src/api-server.ts` and provides:

- **Express Backend**: Lightweight and fast Node.js server
- **CORS Support**: Cross-origin requests for frontend integration
- **Streaming Responses**: Real-time updates during AI processing
- **Error Handling**: Robust error reporting for debugging
- **Wallet Connection**: Secure connection of browser extension wallets
- **Transaction Management**: Pending transaction tracking and status updates
- **Agent Caching**: Efficient agent reuse with expiration for performance

### Technical Improvements

Recent technical improvements to the API server include:

- **Rate Limiting**: Protection against API abuse with configurable rate windows
- **Centralized Logging**: Structured logging with different severity levels
- **Transaction Management**: Dedicated utilities for better transaction reliability
- **Error Handling**: Enhanced error context and reporting
- **API Documentation**: Improved endpoint documentation
- **Code Structure**: Modular organization with better maintainability

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/chat` | POST | Process natural language commands through the AI agent |
| `/api/wallet/connect` | POST | Connect a browser extension wallet address |
| `/api/transactions/pending` | GET | Retrieve pending transactions that need wallet signatures |
| `/api/transactions/:txId/update` | POST | Update transaction status after signing |
| `/api/health` | GET | Health check endpoint for monitoring |

### Starting the API Server

```bash
# Start the API server
npm run api

# Or to run in production with PM2
npm run api:prod
```

### Integration with Frontend

The API server powers the [MictlAI Web Interface](https://github.com/0xOucan/celo-mind-web), allowing users to interact with the AI agent through a modern web UI. The backend handles:

- Natural language processing of user commands
- Blockchain transaction creation
- Wallet integration
- Cross-chain operations between Base, Arbitrum, Mantle, and zkSync Era

## 🌐 Web Interface

MictlAI has a companion web interface available at [MictlAI Web](https://github.com/0xOucan/celo-mind-web) that provides:

- 💬 Interactive AI chat interface for cross-chain commands
- 💰 Real-time wallet balance tracking with USD conversion
- 🌓 Light/Dark theme toggle with system preference detection
- 📱 Responsive design for desktop and mobile
- 🔒 Browser extension wallet integration (MetaMask, Rabby, etc.)
- 🔄 Transaction monitoring and signing directly from your wallet

### Connection Setup

To connect the web interface to the backend, use the included launch script:

```bash
# In the root directory
./launch.sh
```

This script:
1. Starts the API server on port 4000
2. Starts the frontend server on port 5173
3. Handles dependency installation
4. Monitors both processes

## 📚 Technical Documentation

### Protocol Examples

#### Bridge Commands
```
transfer 5 XOC from Base to Arbitrum
transfer 10 MXNB from Arbitrum to Base
transfer 5 XOC from Base to Mantle
transfer 1 USDT from Mantle to Base
transfer 10 MXNB from Arbitrum to Mantle
transfer 2 USDT from Mantle to Arbitrum
transfer 0.5 XOC from Base to zkSync Era
transfer 1 USDT from zkSync Era to Base
check status of transaction 0x123...
view balance on Base
view balance on Arbitrum
view balance on Mantle
view balance on zkSync Era
```

#### Base Network Commands
```
approve 5 XOC for bridge
check XOC balance on Base
get quote for bridging 1 XOC to Arbitrum
get quote for bridging 1 XOC to Mantle
get quote for bridging 1 XOC to zkSync Era
view pending transactions on Base
```

#### Arbitrum Network Commands
```
approve 5 MXNB for bridge
check MXNB balance on Arbitrum
get quote for bridging 1 MXNB to Base
get quote for bridging 1 MXNB to Mantle
get quote for bridging 1 MXNB to zkSync Era
view pending transactions on Arbitrum
```

#### Mantle Network Commands
```
approve 5 USDT for bridge
check USDT balance on Mantle
get quote for bridging 1 USDT to Base
get quote for bridging 1 USDT to Arbitrum
get quote for bridging 1 USDT to zkSync Era
view pending transactions on Mantle
```

#### zkSync Era Network Commands
```
approve 5 USDT for bridge
check USDT balance on zkSync Era
get quote for bridging 1 USDT to Base
get quote for bridging 1 USDT to Arbitrum
get quote for bridging 1 USDT to Mantle
view pending transactions on zkSync Era
```

### Error Handling
MictlAI handles various error scenarios with clear messaging:
- Insufficient balances
- Insufficient allowances
- Network mismatches
- Failed transactions
- Input validation failures
- Cross-chain verification failures

## 🔐 Security

### Smart Contract Security
- ✅ Proven contract track record
- 🔍 Continuous monitoring of all contract interactions
- 🛡️ Automated security checks before transactions

### User Security
- 🔒 No private key storage for web users - browser wallets only
- ✅ Explicit transaction approval required through wallet
- 🛡️ Cross-chain transaction verification
- 🔍 Clear transaction status monitoring
- 🚨 Comprehensive error handling
- 🔐 Network validation to ensure correct network connection

### Enhanced Backend Security
- 🔑 Secure transaction management with dedicated transaction utilities
- 📋 Centralized logging system for monitoring and troubleshooting
- 🚦 API rate limiting to prevent abuse and denial-of-service attacks
- 🛑 Improved input validation across all endpoints
- 🧩 Modular error handling with context-rich errors
- 🔒 Transaction status management with verification

### Best Practices
- 📝 Regular security audits
- 🚫 No storage of sensitive data
- 📊 Real-time transaction monitoring
- ⚡ Rate limiting for API calls
- 🔄 Automatic session timeouts
- 🧪 Comprehensive unit testing for critical components

## 📱 Interface Examples

### Portfolio Overview
```
### 💰 **Complete Portfolio Overview** 💰
**Address**: `0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45`  
**Total Portfolio Value**: **$4.47 USD**

#### 💵 **Token Balances on Base** 💼
- 🟡 **XOC**: 1.32 ($0.66)

#### 💵 **Token Balances on Arbitrum** 💼
- 💵 **MXNB**: 0.28 ($0.28)

#### 💵 **Token Balances on Mantle** 💼
- 💵 **USDT**: 0.5 ($0.5)

#### 💵 **Token Balances on zkSync Era** 💼
- 💵 **USDT**: 1.0 ($1.0)

#### 🌉 **Pending Bridge Transactions** 🏦
- **Base → zkSync Era**: Transferring 0.5 XOC (In Progress)
- **Arbitrum → Base**: Transferring 0.2 MXNB (Completed)
- **Mantle → Base**: Transferring 0.1 USDT (Completed)
```

### Bridge Quote Example
```
📊 **Bridge Quote**

💱 1 XOC ➡️ 0.361129784661843345 MXNB
📈 Exchange Rate: 1 XOC = 0.361130 MXNB

💱 1 XOC ➡️ 0.049750 USDT
📈 Exchange Rate: 1 XOC = 0.049750 USDT

💱 1 XOC ➡️ 0.049750 USDT (zkSync Era)
📈 Exchange Rate: 1 XOC = 0.049750 USDT

⚠️ Rate may fluctuate slightly. Cross-chain transaction will take 5-15 minutes to complete.
```

## 👨‍💻 Development

To extend the platform:
1. Update relevant action providers in `src/action-providers/`
2. Add new schemas in `src/schemas/`
3. Update configurations in `src/config/`
4. Test thoroughly on testnets before production deployment

### Code Architecture Improvements
The project now features improved code architecture:

- **Utility Modules**: 
  - `transaction-utils.ts`: Centralized transaction handling
  - `logger.ts`: Structured logging system
  - `rate-limiter.ts`: API rate limiting

- **Testing**: 
  - Jest-based testing framework
  - Unit tests for core functionality
  - TypeScript-friendly test configuration

- **Error Handling**:
  - Specific error types for different scenarios
  - Context-rich error messages
  - Error logging for better troubleshooting

## 🔗 Resources

### Repository Links
- **Backend (MictlAI DN)**: [https://github.com/0xOucan/celo-mind-dn](https://github.com/0xOucan/celo-mind-dn)
- **Frontend (MictlAI Web)**: [https://github.com/0xOucan/celo-mind-web](https://github.com/0xOucan/celo-mind-web)

### Contact & Social
- **Twitter**: [@0xoucan](https://x.com/0xoucan)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.