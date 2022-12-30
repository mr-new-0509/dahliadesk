// import MyAlgoConnect from "@randlabs/myalgo-connect";
// import { loadStdlib } from "@reach-sh/stdlib";
import bs58 from "bs58";
import { TNetwork } from "./types";

// const reach = loadStdlib();

export const getBalanceOfCurrentUser = async (
  currentUser: string,
  network: TNetwork
) => {
  console.log(">>>>>>> getBalanaceOfCurrentUser");
  // reach.setWalletFallback(
  //   reach.walletFallback({
  //     providerEnv: network,
  //     MyAlgoConnect
  //   })
  // );

  // let balance = await reach.balanceOf(currentUser);
  // console.log(">>>>>>>>> balance => ", balance);
};

export const showFirstLetters = (str: string, lengthToShow: number): string => {
  if (str.length <= lengthToShow) {
    return str;
  } else {
    return str.slice(0, lengthToShow) + "...";
  }
};

export const convertIpfsCidV0ToByte32 = (cid: string) => {
  return `0x${bs58.decode(cid).slice(2).toString()}`;
};
