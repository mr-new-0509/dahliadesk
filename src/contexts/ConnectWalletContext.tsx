import { createContext, useReducer } from 'react';
import { TNetwork, TWalletName } from '../utils/types';

/* --------------------------------------------------------------- */

interface IInitialState {
  currentUser: string;
  walletName?: TWalletName;
  network?: TNetwork;
}

interface IAction {
  type: string;
  payload: any;
}

interface IProps {
  children: any;
}

interface IHandlers {
  [key: string]: Function;
}

/* --------------------------------------------------------------- */

const initialState: IInitialState = {
  currentUser: '',
};

const handlers: IHandlers = {
  SET_NETWORK: (state: object, action: IAction) => {
    return {
      ...state,
      network: action.payload
    };
  },
  SET_CURRENT_USER: (state: object, action: IAction) => {
    return {
      ...state,
      currentUser: action.payload
    };
  },
  SET_WALLET_NAME: (state: object, action: IAction) => {
    return {
      ...state,
      walletName: action.payload
    };
  },
};

const reducer = (state: object, action: IAction) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

//  Context
const ConnectWalletContext = createContext({
  ...initialState,
  connectAct: (network: TNetwork, currentUser: string, walletName: TWalletName) => Promise.resolve(),
  disconnectAct: () => Promise.resolve(),
});

//  Provider
function ConnectWalletProvider({ children }: IProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const connectAct = (network: TNetwork, currentUser: string, walletName: TWalletName) => {
    dispatch({
      type: 'SET_CURRENT_USER',
      payload: currentUser
    })
    dispatch({
      type: 'SET_NETWORK',
      payload: network
    })
    dispatch({
      type: 'SET_WALLET_NAME',
      payload: walletName
    })
  };

  const disconnectAct = () => {
    dispatch({
      type: 'SET_CURRENT_USER',
      payload: ''
    })
    dispatch({
      type: 'SET_NETWORK',
      payload: undefined
    })
    dispatch({
      type: 'SET_WALLET_NAME',
      payload: undefined
    })
  };

  return (
    <ConnectWalletContext.Provider
      value={{
        ...state,
        connectAct,
        disconnectAct,
      }}
    >
      {children}
    </ConnectWalletContext.Provider>
  );
}

export { ConnectWalletContext, ConnectWalletProvider };