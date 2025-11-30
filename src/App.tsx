import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import CreateWallet from "./components/CreateWallet";
import Dashboard from "./components/Dashboard";
import Swap from "./components/Swap";
import Bridge from "./components/Bridge";
import History from "./components/History";
import Pools from "./components/Pools";
import PoolDetail from "./components/PoolDetail";
import AIPools from "./components/AIPools";
import Chatbot from "./components/Chatbot";
import SendComponent from "./components/Send";
import {
  EVMWalletService,
  SolanaWalletService,
} from "./services/walletService";

type Page =
  | "landing"
  | "wallet"
  | "dashboard"
  | "swap"
  | "bridge"
  | "history"
  | "pools"
  | "pool-detail"
  | "ai-pools"
  | "send";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [walletAddresses, setWalletAddresses] = useState<WalletAddresses>({
    ethereum: "",
    bitcoin: "",
    solana: "",
  });
  const [selectedChain, setSelectedChain] = useState<Chain>("ethereum");
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [selectedPoolId, setSelectedPoolId] = useState<string>("1");
  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);

  // Fetch real balance from blockchain
  useEffect(() => {
    const fetchBalance = async () => {
      if (!seedPhrase) {
        setBalance("0");
        return;
      }

      try {
        setIsLoadingBalance(true);

        if (selectedChain === "ethereum") {
          // Use EVMWalletService for Sepolia
          const evmService = new EVMWalletService(seedPhrase, "sepolia");
          const balanceWei = await evmService.getBalance();
          const balanceEth = parseFloat(balanceWei).toFixed(6);
          setBalance(balanceEth);
          evmService.dispose();
        } else if (selectedChain === "solana") {
          // Use SolanaWalletService for Solana Devnet
          const solanaService = new SolanaWalletService(
            seedPhrase,
            "solana-devnet"
          );
          const balanceSol = await solanaService.getBalance();
          setBalance(parseFloat(balanceSol).toFixed(6));
          solanaService.dispose();
        } else {
          // Bitcoin not implemented yet
          setBalance("0");
        }

        setIsLoadingBalance(false);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("0");
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [
    seedPhrase,
    selectedChain,
    walletAddresses.ethereum,
    walletAddresses.solana,
  ]);

  const handleWalletCreated = (addresses: WalletAddresses, seed: string) => {
    setWalletAddresses(addresses);
    setSeedPhrase(seed);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setWalletAddresses({ ethereum: "", bitcoin: "", solana: "" });
    setSelectedChain("ethereum");
    setSeedPhrase("");
    setBalance("0");
    setCurrentPage("landing");
  };

  return (
    <>
      {currentPage === "landing" && (
        <LandingPage onNavigateToWallet={() => setCurrentPage("wallet")} />
      )}

      {currentPage === "wallet" && (
        <CreateWallet
          onBack={() => setCurrentPage("landing")}
          onWalletCreated={handleWalletCreated}
          selectedChain={
            selectedChain === "bitcoin" ? "ethereum" : selectedChain
          }
        />
      )}

      {currentPage === "dashboard" && walletAddresses.ethereum && (
        <Dashboard
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          seedPhrase={seedPhrase}
          onBack={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToPools={() => setCurrentPage("pools")}
          onNavigateToAIPools={() => setCurrentPage("ai-pools")}
          onNavigateToSend={() => setCurrentPage("send")}
        />
      )}

      {currentPage === "swap" && walletAddresses.ethereum && (
        <Swap
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          balance={isLoadingBalance ? "..." : balance}
          seedPhrase={seedPhrase}
          onLogout={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToPools={() => setCurrentPage("pools")}
          onNavigateToAIPools={() => setCurrentPage("ai-pools")}
          onNavigateToSend={() => setCurrentPage("send")}
        />
      )}

      {currentPage === "bridge" && walletAddresses.ethereum && (
        <Bridge
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          balance={isLoadingBalance ? "..." : balance}
          seedPhrase={seedPhrase}
          onLogout={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToPools={() => setCurrentPage("pools")}
          onNavigateToAIPools={() => setCurrentPage("ai-pools")}
          onNavigateToSend={() => setCurrentPage("send")}
        />
      )}

      {currentPage === "history" && walletAddresses.ethereum && (
        <History
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          balance={isLoadingBalance ? "..." : balance}
          seedPhrase={seedPhrase}
          onLogout={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToPools={() => setCurrentPage("pools")}
          onNavigateToAIPools={() => setCurrentPage("ai-pools")}
          onNavigateToSend={() => setCurrentPage("send")}
        />
      )}

      {currentPage === "pools" && walletAddresses.ethereum && (
        <Pools
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          balance={isLoadingBalance ? "..." : balance}
          seedPhrase={seedPhrase}
          onLogout={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToPools={() => setCurrentPage("pools")}
          onNavigateToAIPools={() => setCurrentPage("ai-pools")}
          onNavigateToSend={() => setCurrentPage("send")}
          onNavigateToPoolDetail={(poolId) => {
            setSelectedPoolId(poolId);
            setCurrentPage("pool-detail");
          }}
        />
      )}

      {currentPage === "pool-detail" && walletAddresses.ethereum && (
        <PoolDetail
          poolId={selectedPoolId}
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          balance={isLoadingBalance ? "..." : balance}
          seedPhrase={seedPhrase}
          onLogout={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToPoolsList={() => setCurrentPage("pools")}
        />
      )}

      {currentPage === "ai-pools" && walletAddresses.ethereum && (
        <AIPools
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          balance={isLoadingBalance ? "..." : balance}
          seedPhrase={seedPhrase}
          onLogout={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToSend={() => setCurrentPage("send")}
          onNavigateToPools={() => setCurrentPage("pools")}
          onNavigateToAIPools={() => setCurrentPage("ai-pools")}
        />
      )}

      {currentPage === "send" && walletAddresses.ethereum && (
        <SendComponent
          walletAddress={walletAddresses[selectedChain]}
          walletAddresses={walletAddresses}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          seedPhrase={seedPhrase}
          onLogout={handleLogout}
          onNavigateToSwap={() => setCurrentPage("swap")}
          onNavigateToHistory={() => setCurrentPage("history")}
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
          onNavigateToBridge={() => setCurrentPage("bridge")}
          onNavigateToPools={() => setCurrentPage("pools")}
          onNavigateToSend={() => setCurrentPage("send")}
        />
      )}

      {/* AI Chatbot - Available on all pages except landing */}
      {currentPage !== "landing" && currentPage !== "wallet" && (
        <Chatbot onGoPools={() => setCurrentPage("pools")} />
      )}
    </>
  );
}

export default App;
