import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { sendWalletAddress } from '../services/agentService';
import { apiUrl, DEFAULT_NETWORK } from '../config';

interface WalletContextType {
  connectedAddress: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isBackendSynced: boolean;
  syncStatus: string;
  currentNetwork: string;
  connect: () => void;
  disconnect: () => void;
  switchNetwork: (network: string) => Promise<boolean>;
  wallets: any[];
}

const WalletContext = createContext<WalletContextType>({
  connectedAddress: null,
  isConnecting: false,
  isConnected: false,
  isBackendSynced: false,
  syncStatus: '',
  currentNetwork: DEFAULT_NETWORK,
  connect: () => {},
  disconnect: () => {},
  switchNetwork: async () => false,
  wallets: [],
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const { login, logout, ready, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isBackendSynced, setIsBackendSynced] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [currentNetwork, setCurrentNetwork] = useState<string>(DEFAULT_NETWORK);

  // Update connected wallet address when wallets change
  useEffect(() => {
    if (authenticated && walletsReady && wallets.length > 0) {
      const primaryWallet = wallets[0];
      setConnectedAddress(primaryWallet.address);
      syncWithBackend(primaryWallet.address, currentNetwork);
    } else {
      setConnectedAddress(null);
      setIsBackendSynced(false);
      setSyncStatus('');
    }
  }, [authenticated, wallets, walletsReady, currentNetwork]);

  // Sync wallet with backend
  const syncWithBackend = async (address: string, network: string): Promise<boolean> => {
    if (!address) return false;
    
    setIsConnecting(true);
    
    try {
      const result = await sendWalletAddress(address, network);
      setIsBackendSynced(result.success);
      setSyncStatus(result.message);
      
      if (result.success) {
        console.log(`Successfully connected wallet to backend on ${network}:`, address);
      } else {
        console.warn('Failed to connect wallet to backend:', result.message);
      }
      
      return result.success;
    } catch (error) {
      setIsBackendSynced(false);
      setSyncStatus(error instanceof Error ? error.message : 'Unknown error connecting wallet');
      console.error('Error connecting wallet to backend:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch blockchain network on backend
  const switchNetwork = async (network: string): Promise<boolean> => {
    if (!connectedAddress) {
      console.warn('Cannot switch network: No wallet connected');
      return false;
    }
    
    if (!['base', 'arbitrum', 'mantle', 'zksync'].includes(network)) {
      console.error('Invalid network:', network);
      return false;
    }
    
    try {
      console.log(`Attempting to switch to ${network} network`);
      
      // First, check if we're already on the requested network
      const healthResponse = await fetch(`${apiUrl}/api/health`);
      const healthData = await healthResponse.json();
      
      if (healthData.network === network) {
        console.log(`Already on ${network} network, no switch needed`);
        setCurrentNetwork(network);
        return true;
      }
      
      // Make the network switch request
      const response = await fetch(`${apiUrl}/api/network/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ network })
      });
      
      if (!response.ok) {
        console.error('Failed to switch network:', await response.text());
        return false;
      }
      
      // Update the frontend state
      setCurrentNetwork(network);
      
      // Wait for the backend to complete the switch
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-sync wallet with the new network
      const syncResult = await syncWithBackend(connectedAddress, network);
      
      if (!syncResult) {
        console.warn(`Network switched to ${network}, but wallet sync failed`);
        // Still return true as the network was switched
      }
      
      // Verify the switch was successful
      try {
        const verifyResponse = await fetch(`${apiUrl}/api/health`);
        const verifyData = await verifyResponse.json();
        
        if (verifyData.network !== network) {
          console.warn(`Network switch verification failed: Backend still on ${verifyData.network}`);
          
          // Try once more
          await fetch(`${apiUrl}/api/network/select`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ network })
          });
        }
      } catch (verifyError) {
        console.error('Error verifying network switch:', verifyError);
      }
      
      console.log(`Successfully switched to ${network} network`);
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      return false;
    }
  };

  const connect = () => {
    login();
  };

  const disconnect = () => {
    logout();
    setConnectedAddress(null);
    setIsBackendSynced(false);
  };

  const value = {
    connectedAddress,
    isConnecting,
    isConnected: !!connectedAddress,
    isBackendSynced,
    syncStatus,
    currentNetwork,
    connect,
    disconnect,
    switchNetwork,
    wallets,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}; 