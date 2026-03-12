import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';
import { useState, useEffect, useCallback } from 'react';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });
export const network = STACKS_MAINNET;

export function useStacks() {
  const [userData, setUserData] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  const checkUserSession = useCallback(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((data) => {
        setUserData(data);
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  useEffect(() => {
    if (userData) {
      fetchBalance(userData.profile.stxAddress.mainnet);
    }
  }, [userData]);

  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/balances`);
      const data = await response.json();
      const stxBalance = parseInt(data.stx.balance) / 1000000;
      setBalance(stxBalance.toString());
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'STX Pay',
        icon: window.location.origin + '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setBalance('0');
  };

  return {
    userData,
    balance,
    loading,
    connectWallet,
    disconnectWallet,
    stxAddress: userData?.profile.stxAddress.mainnet,
  };
}
