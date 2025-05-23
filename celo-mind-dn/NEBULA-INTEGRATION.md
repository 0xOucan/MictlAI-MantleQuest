# 🤖 Nebula AI Integration

## Overview

The Nebula AI integration brings advanced natural language blockchain interactions to MictlAI through thirdweb's Nebula AI platform. This integration is specifically designed for the Mantle network (Chain ID: 5000) and provides intelligent assistance for DeFi operations, portfolio analysis, and blockchain insights.

## 🚀 Features

### Core Capabilities
- **Natural Language Processing**: Chat with AI about blockchain operations using plain English
- **Transaction Execution**: Execute complex blockchain operations through conversational interfaces
- **Portfolio Analysis**: Get AI-powered insights about your DeFi positions and strategies
- **Real-time Data Queries**: Query blockchain data using natural language
- **Strategic Recommendations**: Receive AI-generated suggestions for yield optimization

### Supported Operations
- DeFi protocol interactions (Lendle, Treehouse, Merchant Moe, Init Capital)
- Token analysis and portfolio insights
- Transaction explanation and analysis
- Yield strategy recommendations
- Market opportunity identification
- Smart contract interaction guidance

## 🔧 Technical Implementation

### Action Provider Structure
```
src/action-providers/nebula/
├── nebulaActionProvider.ts    # Main provider implementation
├── constants.ts               # Configuration and constants
├── schemas.ts                 # Zod validation schemas
├── errors.ts                  # Custom error classes
├── index.ts                   # Export definitions
└── test.ts                    # Test suite
```

### Key Components

#### 1. NebulaActionProvider Class
- **chatWithNebula**: Natural language conversations
- **executeNebulaTransactions**: Execute AI-generated transactions
- **queryWithNebula**: Blockchain data queries
- **reasonWithNebula**: AI analysis and explanations
- **assistWithNebula**: General AI assistance

#### 2. Configuration
- **Network**: Mantle (Chain ID: 5000)
- **API Base**: `https://nebula-api.thirdweb.com`
- **Authentication**: thirdweb secret key
- **Timeout**: 30 seconds
- **Retries**: 3 attempts

#### 3. Error Handling
- `NebulaConfigurationError`: Missing or invalid configuration
- `NebulaNetworkError`: Network-related issues
- `NebulaAPIError`: API response errors
- `NebulaResponseError`: Invalid response format
- `NebulaExecutionError`: Transaction execution failures

## 🎯 Usage Examples

### Basic Chat
```
"Ask Nebula about my portfolio"
"Analyze my DeFi positions"
"What yield opportunities are available?"
```

### Transaction Analysis
```
"Explain this transaction: 0x123..."
"Analyze my recent Lendle deposits"
"What happened in my last swap?"
```

### Strategy Recommendations
```
"Suggest optimal yield strategies"
"What's the best way to use my MNT tokens?"
"How can I optimize my Mantle DeFi positions?"
```

### Data Queries
```
"What's my current Lendle position?"
"Show me my Treehouse staking rewards"
"Check my token balances on Mantle"
```

## 🔗 Integration Points

### Frontend Integration
- **Detection Keywords**: Added to `detectNetworkSpecificRequest` function
- **InfoPanel**: Updated to showcase Nebula AI capabilities
- **Network Switching**: Automatic Mantle network suggestion for Nebula requests

### Backend Integration
- **API Server**: Protocol detection includes Nebula keywords
- **Chatbot**: Integrated into Mantle network action providers
- **Agent Initialization**: Automatic inclusion when on Mantle network

### Environment Configuration
```bash
# Required environment variable
YOUR_THIRDWEB_SECRET_KEY=your_secret_key_here
```

## 📋 Testing

### Test Coverage
- Provider initialization
- Configuration validation
- Error handling
- Network compatibility
- API integration

### Running Tests
```bash
npm test -- --testNamePattern="nebula"
```

## 🔒 Security Considerations

### API Key Management
- Secret key stored in environment variables
- No key exposure in client-side code
- Secure transmission to thirdweb API

### Network Validation
- Strict Mantle network enforcement
- Chain ID verification
- Wallet address validation

### Error Handling
- Graceful degradation on API failures
- User-friendly error messages
- Comprehensive logging for debugging

## 🚀 Deployment

### Prerequisites
1. thirdweb account with API access
2. Valid secret key configured
3. Mantle network RPC access
4. MictlAI backend running

### Configuration Steps
1. Set `YOUR_THIRDWEB_SECRET_KEY` environment variable
2. Ensure Mantle network is selected
3. Connect wallet to Mantle network
4. Start using Nebula AI features

## 📊 Performance Metrics

### Response Times
- Chat requests: ~2-5 seconds
- Data queries: ~1-3 seconds
- Transaction execution: ~5-15 seconds
- Analysis requests: ~3-8 seconds

### Rate Limits
- API calls: Managed by thirdweb
- Session caching: 30-minute expiration
- Retry logic: 3 attempts with backoff

## 🔮 Future Enhancements

### Planned Features
- Multi-chain support expansion
- Advanced portfolio analytics
- Automated strategy execution
- Integration with more DeFi protocols
- Enhanced natural language understanding

### Potential Integrations
- Cross-chain analysis
- NFT portfolio insights
- Governance participation guidance
- Risk assessment tools
- Market sentiment analysis

## 📚 Documentation Links

- [thirdweb Nebula AI Documentation](https://portal.thirdweb.com/nebula)
- [Mantle Network Documentation](https://docs.mantle.xyz/)
- [MictlAI Action Provider Guide](./README.md)

## 🆘 Troubleshooting

### Common Issues

#### 1. Configuration Error
```
Error: YOUR_THIRDWEB_SECRET_KEY environment variable is required
```
**Solution**: Set the environment variable with your thirdweb secret key

#### 2. Network Error
```
Error: Nebula AI is only supported on Mantle network
```
**Solution**: Switch to Mantle network in your wallet and frontend

#### 3. API Timeout
```
Error: Request timeout after 30 seconds
```
**Solution**: Check network connectivity and try again

#### 4. Invalid Response
```
Error: Invalid or unparseable response from Nebula
```
**Solution**: Verify API key and check thirdweb service status

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=nebula:*
```

## 📞 Support

For issues related to:
- **Nebula AI**: Contact thirdweb support
- **MictlAI Integration**: Create an issue in the repository
- **Mantle Network**: Check Mantle documentation

---

*This integration enhances MictlAI's capabilities by bringing advanced AI-powered blockchain interactions to the Mantle ecosystem, making DeFi operations more accessible through natural language interfaces.* 