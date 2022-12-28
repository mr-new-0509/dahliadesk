// import MyAlgoConnect from "@randlabs/myalgo-connect";
// import { loadStdlib } from "@reach-sh/stdlib";
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
