# 🧠 MictlAI Web Interface

## 📑 Table of Contents
- [The MictlAI Legend](#-the-mictlai-legend)
- [MictlAI: The Mantle Quest](#-mictlai-the-mantle-quest)
- [Features](#-features)
- [🤖 NEBULA AI Integration](#-nebula-ai-integration)
- [Mantle Network Integrations](#-mantle-network-integrations)
- [Getting Started](#-getting-started)
- [Backend Integration](#-backend-integration)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [Running the Complete Stack](#-running-the-complete-stack)
- [Security Considerations](#-security-considerations)
- [Cross-Chain Bridge Features](#-cross-chain-bridge-features)
- [Contributing](#-contributing)
- [Related Projects](#-related-projects)
- [Contact](#-contact)

## 🏺 The MictlAI Legend

In ancient Aztec mythology, Mictlantecuhtli ruled Mictlan, the underworld—a realm where souls journeyed after death, navigating nine challenging levels to reach their final destination.

Today, MictlAI emerges as a digital guardian of the blockchain underworld, facilitating seamless passage between disparate realms. Just as Mictlantecuhtli guided souls through Mictlan's levels, MictlAI guides your assets across the complex landscape of multiple blockchains.

The journey of your tokens—from Base to Arbitrum, Mantle to zkSync Era—mirrors the soul's journey through Mictlan's territories. With MictlAI as your guide, these journeys become seamless, secure, and swift.

Where traditional bridges have failed through hacks and exploits, MictlAI's atomic swap mechanism creates a direct, trustless pathway between blockchain worlds—a pathway guarded by the wisdom of AI and the security of decentralized protocols.

## 🚀 MictlAI: The Mantle Quest

**[MictlAI: The Mantle Quest](https://github.com/0xOucan/MictlAI-MantleQuest)** is an enhanced version that includes all the same core functionalities as the original MictlAI plus exciting new integrations specifically designed for the Mantle ecosystem. This Cookathon project showcases advanced DeFi interactions through AI-powered interfaces.

### 🆕 Mantle-Specific Features
- **🤖 NEBULA AI Integration**: Conversational AI for DeFi operations on Mantle
- **🌳 Treehouse Protocol**: cmETH staking interface with yield tracking
- **🏦 Lendle Protocol**: MNT/USDT lending and borrowing dashboard
- **🔄 Merchant Moe**: Advanced DEX interface with optimal routing
- **📊 Portfolio Management**: AI-powered DeFi position analysis

## 🌟 Features

- 💬 Natural language AI chat interface for cross-chain operations
- **🤖 Advanced NEBULA AI integration for intelligent DeFi assistance on Mantle**
- **🌳 Treehouse Protocol staking interface with real-time yield tracking**
- **🏦 Lendle Protocol lending dashboard with health factor monitoring**
- **🔄 Merchant Moe DEX interface with optimal swap routing**
- 👛 External wallet support with secure transaction handling
- 🔄 Real-time transaction monitoring and status tracking
- 💰 Real-time wallet balance tracking with USD conversion
- 🌓 Light/Dark theme toggle with system preference detection
- 📱 Responsive design for desktop and mobile devices
- 🔒 Direct blockchain connection for verification
- ⚡ Cross-chain bridging between Base, Arbitrum, Mantle, and zkSync Era networks
- 🛡️ Enhanced security with no stored private keys
- 🔌 Network validation and automatic network switching

## 🤖 NEBULA AI Integration

The **NEBULA AI integration** brings conversational AI directly to the MictlAI web interface, transforming how users interact with DeFi protocols on Mantle:

### 🎯 Frontend Features
- **🗣️ Natural Language Interface**: Chat with AI about DeFi operations using plain English
- **📊 Visual Portfolio Analysis**: AI-generated insights displayed with interactive charts
- **💡 Strategy Recommendations**: Visual presentation of yield optimization suggestions
- **🔍 Transaction Explanations**: AI-powered breakdowns of complex DeFi operations
- **⚡ Real-time Assistance**: Instant help with protocol interactions and guidance

### 💬 Example Interface Interactions
The web interface makes NEBULA AI accessible through intuitive chat:

```
User: "Show me my Mantle portfolio and suggest optimizations"
🤖 NEBULA: Analyzing your positions across Lendle, Treehouse, and Merchant Moe...

📊 Portfolio Summary:
• 150 MNT in Lendle (earning 8.5% APY)
• 5 cmETH in Treehouse (earning 12% APY)
• 1,000 USDT available for deployment

💡 Optimization Suggestions:
1. Convert 50 MNT to USDT via Merchant Moe for diversification
2. Stake additional cmETH in Treehouse for higher yields
3. Consider using MNT as collateral to borrow and leverage positions

Would you like me to execute any of these strategies?
```

### 🎨 Visual Integration
- **Chat Interface**: Seamlessly integrated into the main chat panel
- **Protocol Cards**: Visual cards showing Mantle protocol integrations
- **Portfolio Dashboard**: AI-enhanced portfolio overview with recommendations
- **Transaction Flows**: Visual representation of multi-step DeFi operations

## 🛡️ Mantle Network Integrations

The web interface provides comprehensive support for Mantle ecosystem protocols:

### 🌳 Treehouse Protocol Interface
- **Staking Dashboard**: Visual overview of cmETH staking positions
- **Yield Tracking**: Real-time display of staking rewards and APY
- **One-Click Staking**: Streamlined approve and stake interface
- **Position Management**: Easy withdrawal and position optimization tools

### 🏦 Lendle Protocol Interface
- **Lending Dashboard**: Visual overview of MNT and USDT positions
- **Health Factor Monitor**: Real-time liquidation risk assessment
- **Collateral Management**: Easy supply and withdrawal interfaces
- **APY Tracking**: Live display of lending and borrowing rates

### 🔄 Merchant Moe Interface
- **Swap Interface**: Optimized MNT ⟷ USDT trading with live price feeds
- **Route Visualization**: Display of optimal swap routing and price impact
- **Slippage Controls**: Advanced slippage and deadline management
- **Transaction Tracking**: Real-time swap progress monitoring

## 🚀 Getting Started

### Prerequisites

- Node.js v16+ and npm v7+
- MictlAI backend API running and accessible
- Web browser with JavaScript enabled
- Browser extension wallet (MetaMask, Rabby, etc.) for blockchain transactions

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

The launch script automatically:
1. Installs dependencies for both repositories
2. Starts the backend API server
3. Starts the frontend development server
4. Connects them together with proper configuration

### Configuration

The application requires the following environment variables:

```
# API endpoint for the MictlAI backend
VITE_API_URL=http://localhost:4000

# Explorer URLs for transaction links
VITE_BASE_EXPLORER_URL=https://basescan.org
VITE_ARBITRUM_EXPLORER_URL=https://arbiscan.io
VITE_MANTLE_EXPLORER_URL=https://mantlescan.xyz
VITE_ZKSYNC_EXPLORER_URL=https://explorer.zksync.io

# Privy App ID for wallet integration
VITE_PRIVY_APP_ID=your_privy_app_id

# Escrow wallet address for liquidity monitoring
VITE_ESCROW_WALLET_ADDRESS=0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45
```

## 🔌 Backend Integration

This web interface connects to the [MictlAI backend API](https://github.com/0xOucan/celo-mind-dn) to process commands and execute blockchain operations.

### Communication Flow

1. **User Interface**: The web frontend collects user inputs through a conversational interface
2. **API Requests**: Frontend sends natural language commands to the `/api/agent/chat` endpoint
3. **AI Processing**: Backend processes commands using advanced AI and Agent Orchestration
4. **Blockchain Operations**: Backend creates transaction requests for the frontend wallet to sign
5. **Transaction Handling**: Frontend monitors and processes pending transactions with the connected wallet
6. **Response Handling**: Frontend displays results and updates wallet balances

### Wallet Integration

MictlAI supports external wallets through the Privy integration:

- **Wallet Connection**: Connect any EIP-1193 compatible wallet (MetaMask, Rabby, etc.)
- **Transaction Signing**: Transactions generated by the AI are sent to your wallet for signing
- **Transaction Monitoring**: Monitor transaction status in real-time through the UI
- **Wallet Balances**: View your wallet's token balances and total portfolio value
- **Network Switching**: Automatic network detection and switching
- **Security**: No private keys stored in the application or backend

## 📂 Project Structure

```
celo-mind-web/
├── src/
│   ├── components/           # React UI components
│   │   ├── ChatInterface.tsx # AI chat interface
│   │   ├── Header.tsx        # Application header
│   │   ├── Icons.tsx         # SVG icon components
│   │   ├── InfoPanel.tsx     # Welcome/information panel
│   │   ├── WalletBalances.tsx # Wallet balance display
│   │   ├── WalletConnect.tsx  # Wallet connection component
│   │   ├── MainLayout.tsx    # Layout wrapper with dark mode support
│   │   └── TransactionMonitor.tsx # Transaction monitoring UI
│   ├── providers/
│   │   ├── PrivyProvider.tsx  # Privy wallet provider integration
│   │   └── WalletContext.tsx  # Wallet state management
│   ├── services/
│   │   ├── agentService.ts    # Agent API communication
│   │   ├── blockchainService.ts # Blockchain connection services
│   │   └── transactionService.ts # Transaction handling and processing
│   ├── App.tsx               # Main application component
│   ├── config.ts             # Application configuration
│   ├── index.css             # Global CSS
│   └── main.tsx              # Application entry point
├── index.html                # HTML template
├── package.json              # Project dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration
```

## 🧩 Key Components

### 1. WalletContext
The central wallet management system provides:
- Wallet connection state management
- Backend synchronization
- Address tracking and formatting
- Integration with Privy authentication

### 2. TransactionMonitor
Monitors and processes transactions by:
- Polling for pending transactions
- Creating wallet clients for signing
- Network validation and switching
- Transaction status tracking
- Error handling with helpful messages

### 3. WalletBalances
Real-time balance tracking with:
- Direct blockchain data fetching with viem
- USD conversion with market prices
- Visual indicators for token types
- One-click refresh functionality
- Blockchain explorer integration for verification

### 4. LiquidityMonitor
Escrow wallet liquidity tracking with:
- Displays available liquidity of specific tokens (MXNB, USDT, XOC)
- Monitors balances across multiple chains (Base, Arbitrum, Mantle, zkSync)
- Direct link to Debank profile for detailed analysis
- Configurable escrow wallet address via environment variables
- Automatic refresh of balance data

### 5. ChatInterface
Intelligent conversation interface with:
- Message history tracking
- Stream-based response handling
- Transaction status updates
- Response formatting and error handling
- Pre-checks for wallet connection

## 🌐 Running the Complete Stack

For the best experience, run both the frontend and backend together:

```bash
# Start both servers using the launch script
./launch.sh
```

This will start:
- Backend API server at http://localhost:4000
- Frontend development server at http://localhost:5173

## 🔐 Security Considerations

The MictlAI web interface implements several security best practices:

- **No Private Key Storage**: Private keys never leave your wallet - all transactions require explicit approval
- **Secure Wallet Connections**: Implemented via Privy integration with industry-standard security
- **Transaction Verification**: All transactions include clear information about what you're approving
- **Network Validation**: Automatic verification of the correct network before transactions
- **Session-Based Authentication**: Wallet connections persist only for the current session
- **Transaction Monitoring**: Complete visibility into all pending and processed transactions
- **Error Handling**: Comprehensive error handling prevents security issues from failed operations
- **Data Validation**: All inputs are validated before processing to prevent injection attacks
- **Rate Limiting**: API endpoints implement rate limiting to prevent abuse

## 🔄 Cross-Chain Bridge Features

MictlAI implements a robust cross-chain bridging system:

1. **Multiple Networks**: Supports bridging between Base, Arbitrum, Mantle, and zkSync Era networks
2. **Multiple Tokens**: Transfer XOC, MXNB, and USDT tokens across chains
3. **Atomic Swaps**: Trustless cross-chain token swaps using an escrow mechanism
4. **Real-time Status**: Monitor swap progress across chains in real-time
5. **Fee Transparency**: Clear display of bridge fees (0.5%) and final received amount
6. **Explorer Integration**: Direct links to view transactions on BaseScan, ArbiScan, MantleScan, and zkSync Explorer

### Supported Bridges

| From | To | Tokens |
|------|----|----|
| Base | Arbitrum | XOC → MXNB |
| Arbitrum | Base | MXNB → XOC |
| Base | Mantle | XOC → USDT |
| Mantle | Base | USDT → XOC |
| Arbitrum | Mantle | MXNB → USDT |
| Mantle | Arbitrum | USDT → MXNB |
| Base | zkSync Era | XOC → USDT |
| zkSync Era | Base | USDT → XOC |
| Arbitrum | zkSync Era | MXNB → USDT |
| zkSync Era | Arbitrum | USDT → MXNB |
| Mantle | zkSync Era | USDT → USDT |
| zkSync Era | Mantle | USDT → USDT |

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Related Projects

- [MictlAI Backend (DN)](https://github.com/0xOucan/celo-mind-dn) - AI agent backend for cross-chain operations

## 📧 Contact

- Twitter: [@0xoucan](https://x.com/0xoucan)

## 📄 License

This project is licensed under the MIT License.
