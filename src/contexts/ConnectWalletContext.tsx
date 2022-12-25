import { createContext, useReducer } from 'react';
import { TNetwork } from '../utils/types';

/* --------------------------------------------------------------- */

interface IInitialState {
  connected: boolean;
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
  connected: false,
};

const handlers: IHandlers = {
  SET_CONNECTED: (state: object, action: IAction) => {
    return {
      ...state,
      connected: action.payload
    };
  },
  SET_NETWORK: (state: object, action: IAction) => {
    return {
      ...state,
      network: action.payload
    };
  },
};

const reducer = (state: object, action: IAction) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

//  Context
const ConnectWalletContext = createContext({
  ...initialState,
  connectAct: (network: TNetwork) => Promise.resolve(),
  disconnectAct: () => Promise.resolve(),
  switchNetworkAct: (network: TNetwork) => Promise.resolve()
});

//  Provider
function ConnectWalletProvider({ children }: IProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const connectAct = (network: TNetwork) => {
    dispatch({
      type: 'SET_CONNECTED',
      payload: true
    });
    dispatch({
      type: 'SET_NETWORK',
      payload: network
    });
  };

  const disconnectAct = () => {
    dispatch({
      type: 'SET_CONNECTED',
      payload: true
    });
    dispatch({
      type: 'SET_NETWORK',
      payload: undefined
    });
  };

  const switchNetworkAct = (network: TNetwork) => {
    dispatch({
      type: 'SET_NETWORK',
      payload: network
    })
  }

  return (
    <ConnectWalletContext.Provider
      value={{
        ...state,
        connectAct,
        disconnectAct,
        switchNetworkAct
      }}
    >
      {children}
    </ConnectWalletContext.Provider>
  );
}

export { ConnectWalletContext, ConnectWalletProvider };