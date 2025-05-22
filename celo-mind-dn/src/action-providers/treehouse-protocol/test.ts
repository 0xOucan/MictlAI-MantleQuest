import { TreehouseProtocolActionProvider, treehouseProtocolActionProvider } from './treehouseProtocolActionProvider';
import { TreehouseToken, ChainConstants } from './constants';
import { EvmWalletProvider, WalletProvider } from '@coinbase/agentkit';

// Create a mock wallet provider for testing
const mockWalletProvider: Partial<EvmWalletProvider> = {
  getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  getNetwork: jest.fn().mockResolvedValue({ chainId: '5000', name: 'mantle' }),
  nativeTransfer: jest.fn(),
  sendTransaction: jest.fn(),
  signMessage: jest.fn(),
  readContract: jest.fn().mockImplementation(({ functionName, args }) => {
    // Mock stakedBalances function
    if (functionName === 'stakedBalances') {
      return BigInt(1000000000000000000); // 1 token with 18 decimals
    }
    // Mock balanceOf function
    if (functionName === 'balanceOf') {
      return BigInt(5000000000000000000); // 5 tokens with 18 decimals
    }
    // Mock decimals function
    if (functionName === 'decimals') {
      return 18;
    }
    // Mock symbol function
    if (functionName === 'symbol') {
      return 'cmETH';
    }
    return BigInt(0);
  })
};

// Basic test to check that the action provider is exported correctly
describe('TreehouseProtocolActionProvider', () => {
  it('should export the action provider', () => {
    expect(treehouseProtocolActionProvider).toBeDefined();
  });

  it('should create an instance of TreehouseProtocolActionProvider', () => {
    const provider = treehouseProtocolActionProvider(mockWalletProvider as WalletProvider);
    expect(provider).toBeInstanceOf(TreehouseProtocolActionProvider);
  });

  it('should have the correct name', () => {
    const provider = treehouseProtocolActionProvider(mockWalletProvider as WalletProvider);
    expect(provider.name).toBe('treehouse-protocol');
  });

  // Test token enumeration
  it('should have cmETH token defined', () => {
    expect(TreehouseToken.CM_ETH).toBe('cmETH');
  });

  // Test staked balance retrieval
  it('should correctly retrieve staked balance using stakedBalances function', async () => {
    const provider = treehouseProtocolActionProvider(mockWalletProvider as WalletProvider);
    const result = await provider.getUserStakingData(mockWalletProvider as EvmWalletProvider, {});
    
    // Should contain the staked balance of 1 cmETH
    expect(result).toContain('Staked Balance: 1 cmETH');
    // Should contain the wallet balance of 5 cmETH
    expect(result).toContain('Wallet Balance: 5 cmETH');
  });
}); 