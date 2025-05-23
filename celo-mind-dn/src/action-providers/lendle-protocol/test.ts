import { LendleProtocolActionProvider, lendleProtocolActionProvider } from './lendleProtocolActionProvider';
import { ChainConstants } from './constants';
import { EvmWalletProvider, WalletProvider } from '@coinbase/agentkit';

// Create a mock wallet provider for testing
const mockWalletProvider: Partial<EvmWalletProvider> = {
  getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  getNetwork: jest.fn().mockResolvedValue({ chainId: '5000', name: 'mantle' }),
  nativeTransfer: jest.fn(),
  sendTransaction: jest.fn(),
  signMessage: jest.fn(),
  getBalance: jest.fn().mockResolvedValue(BigInt(5000000000000000000)), // 5 MNT
  readContract: jest.fn().mockImplementation(({ functionName, args }) => {
    // Mock getUserAccountData function
    if (functionName === 'getUserAccountData') {
      return [
        BigInt(2000000000000000000), // totalCollateralETH: 2 MNT
        BigInt(1000000000000000000), // totalDebtETH: 1 MNT
        BigInt(1000000000000000000), // availableBorrowsETH: 1 MNT
        BigInt(8000), // currentLiquidationThreshold: 80%
        BigInt(7500), // ltv: 75%
        BigInt(2000000000000000000), // healthFactor: 2.0
      ];
    }
    return BigInt(0);
  })
};

// Basic test to check that the action provider is exported correctly
describe('LendleProtocolActionProvider', () => {
  it('should export the action provider', () => {
    expect(lendleProtocolActionProvider).toBeDefined();
  });

  it('should create an instance of LendleProtocolActionProvider', () => {
    const provider = lendleProtocolActionProvider(mockWalletProvider as WalletProvider);
    expect(provider).toBeInstanceOf(LendleProtocolActionProvider);
  });

  it('should have the correct name', () => {
    const provider = lendleProtocolActionProvider(mockWalletProvider as WalletProvider);
    expect(provider.name).toBe('lendle-protocol');
  });

  // Test account data retrieval
  it('should correctly retrieve user account data', async () => {
    const provider = lendleProtocolActionProvider(mockWalletProvider as WalletProvider);
    const result = await provider.getUserAccountData(mockWalletProvider as EvmWalletProvider, {});
    
    // Should contain the total collateral
    expect(result).toContain('Total Collateral: 2 MNT');
    // Should contain the health factor
    expect(result).toContain('Health Factor: 2.0');
  });
}); 