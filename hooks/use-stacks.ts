import { useState, useEffect, useCallback } from 'react';
import { STACKS_MAINNET } from '@stacks/network';

// Constants
export const network = STACKS_MAINNET;

export function useStacks() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [isConnectedState, setIsConnectedState] = useState(false);

  const fetchBalance = async (stxAddress: string) => {
    try {
      const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${stxAddress}/balances`);
      const data = await response.json();
      const stxBalance = parseInt(data.stx.balance) / 1000000;
      setBalance(stxBalance.toString());
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const { isConnected, getLocalStorage } = await import('@stacks/connect');
      const connected = isConnected();
      setIsConnectedState(connected);

      if (connected) {
        const storage = getLocalStorage();
        if (storage?.addresses?.stx && storage.addresses.stx.length > 0) {
          const stxAddr = storage.addresses.stx[0].address;
          setAddress(stxAddr);
          fetchBalance(stxAddr);
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;
    try {
      const { connect } = await import('@stacks/connect');
      await connect({
        forceWalletSelect: true,
      });
      // After connection, re-check
      checkConnection();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const disconnectWallet = async () => {
    if (typeof window === 'undefined') return;
    try {
      const { disconnect } = await import('@stacks/connect');
      disconnect();
      setAddress('');
      setBalance('0');
      setIsConnectedState(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    userData: isConnectedState ? { profile: { stxAddress: { mainnet: address } } } : null,
    stxAddress: address,
    balance,
    loading,
    connectWallet,
    disconnectWallet,
    isConnected: isConnectedState,
  };
}
