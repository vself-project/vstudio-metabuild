import { providers, utils } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";
import { CONTRACT_ID } from "../constants";
import { useWalletSelector } from "../contexts/WalletSelectorContext";

const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;
const NO_DEPOSIT = "0";

interface IViewMethod {
  method: string;
  args?: object;
}

interface ICallMethod {
  method: string;
  args?: object;
  gas?: string;
  deposit?: string;
}

export const useContractInteractor = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector();

  const handleSignIn = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  const viewMethod = async ({ method, args = {} }: IViewMethod) => {
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const res = await provider.query<CodeResult>({
      request_type: "call_function",
      account_id: CONTRACT_ID,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      finality: "optimistic",
    });

    return JSON.parse(Buffer.from(res.result).toString());
  };

  const callMethod = async ({
    method,
    args = {},
    gas = BOATLOAD_OF_GAS,
    deposit = NO_DEPOSIT,
  }: ICallMethod) => {
    const { contract } = selector.store.getState();
    const wallet = await selector.wallet();

    const outcome = await wallet.signAndSendTransaction({
      signerId: accountId!,
      receiverId: CONTRACT_ID,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });

    return providers.getTransactionLastResult(outcome!);
  };

  return { handleSignIn, handleSignOut, viewMethod, callMethod };
};

export const getRandomInt = async (max: number) => {
  return Math.floor(Math.random() * (max + 1));
};

export const toHexString = (byteArray: any) => {
  return Array.from(byteArray, (byte: any) => {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
};

export const downloadObjectAsJson = (exportObj: any, exportName: string) => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
