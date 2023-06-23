import {
  CHAIN,
  getRamperSigner,
  getUser,
  getWalletModel,
  init,
  openWallet,
  sendToken,
  signIn,
  signOut,
  User,
} from "@ramper/ethereum";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";

init({
  appName: "EVM Test App",
  walletProviders: ["metamask"],
  defaultTokenAddresses: ["0x514910771af9ca656af840dff83e8264ecf986ca"],
  theme: "light",
  network: "maticmum",
  authProviders: ["google", "facebook", "twitter", "apple", "email"],
});

const alchemy = new ethers.providers.AlchemyProvider(
  80001,
  "pEWvHrkSkkyWGZmezdGMk_LjYu8DAx1k"
);

function App() {
  const [user, setUser] = useState(getUser());
  const wallet = useMemo(() => {
    return user ? getWalletModel(window.localStorage, CHAIN.ETHEREUM) : null;
  }, [user]);
  console.log(wallet)
  const handleSignIn = async () => {
    const signInResult = await signIn();
    setUser(signInResult.user ?? null);
  };
  console.log(user);
  const handleSendToken = async () => {
    try {
      const isSuccess = await sendToken({
        to: "0xa419dfa199Df8651c3f4476546AF5E4CC4E0F73F",
        value: "0.000001",
        network: "mainnet",
      });
      console.log("sendToekn result: ", isSuccess);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTransactionWithRamperSigner = async () => {
    if (!wallet) {
      console.log("No wallet");
      return;
    }

    const signer = await getRamperSigner(alchemy);

    const value = ethers.utils.parseEther("0.0000001");
    const gasLimit = await alchemy.estimateGas({
      to: "0xa419dfa199Df8651c3f4476546AF5E4CC4E0F73F",
      value,
    });
    const feeData = await alchemy.getFeeData();
    console.log(feeData)
    try {
      signer.sendTransaction({
        type: 2,
        from: wallet.publicKey,
        to: "0xa419dfa199Df8651c3f4476546AF5E4CC4E0F73F",
        value,
        chainId: 80001,
        nonce: alchemy.getTransactionCount(wallet.publicKey),
        gasLimit: gasLimit,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
  };

  const handleOpenWalletView = () => {
    openWallet();
  };
  const handleGetBalance = async () => {
    const provider = ethers.getDefaultProvider()
    const balance = await provider.getBalance(wallet?.publicKey)
    console.log(ethers.utils.formatEther(balance))
  }
  return (
    <div
      style={{
        padding: "20px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p>Ramper Ethereum Example</p>
        <button onClick={handleGetBalance}>Get Balance</button>
        <button onClick={handleSignIn}>Sign in</button>
        <br />
        <button onClick={openWallet}>My Wallet</button>
        <button onClick={handleSendToken}>Test sendToken</button>
        <br />
        <button onClick={handleSendTransactionWithRamperSigner}>
          Test sendTransaction with RamperSigner
        </button>
        <br />
        <button onClick={handleOpenWalletView}>Open WalletView</button>
        <br />
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  );
}

export default App;
