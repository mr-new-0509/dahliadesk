import { useContext } from 'react';
import { ConnectWalletContext } from '../contexts/ConnectWalletContext';

const useConnectWallet = () => useContext(ConnectWalletContext);

export default useConnectWallet;