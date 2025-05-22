import { TreehouseProtocolActionProvider, treehouseProtocolActionProvider } from './treehouseProtocolActionProvider';
import { TreehouseToken } from './constants';
import { EvmWalletProvider, WalletProvider } from '@coinbase/agentkit';

// Create a mock wallet provider for testing
const mockWalletProvider: Partial<EvmWalletProvider> = {
  getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  getNetwork: jest.fn().mockResolvedValue({ chainId: '5000', name: 'mantle' }),
  nativeTransfer: jest.fn(),
  sendTransaction: jest.fn(),
  signMessage: jest.fn(),
  readContract: jest.fn()
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
}); 