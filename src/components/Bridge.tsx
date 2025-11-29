import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  ArrowRightLeft,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  EVMWalletService,
  SolanaWalletService,
  NETWORKS,
} from "../services/walletService";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface BridgeProps {
  walletAddress: string;
  walletAddresses: WalletAddresses;
  selectedChain: Chain;
  onChainChange: (chain: Chain) => void;
  balance: string;
  seedPhrase: string;
  onLogout: () => void;
  onNavigateToSwap: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToBridge?: () => void;
  onNavigateToPools?: () => void;
  onNavigateToAIPools?: () => void;
  onNavigateToSend?: () => void;
}

type NetworkKey = "sepolia" | "ethereum" | "solana-devnet" | "solana-testnet";

interface NetworkOption {
  key: NetworkKey;
  name: string;
  type: "evm" | "solana";
  logo: string;
  symbol: string;
  isTestnet: boolean;
}

const networkOptions: NetworkOption[] = [
  {
    key: "sepolia",
    name: "Sepolia Testnet",
    type: "evm",
    logo: "⟠",
    symbol: "ETH",
    isTestnet: true,
  },
  {
    key: "ethereum",
    name: "Ethereum Mainnet",
    type: "evm",
    logo: "⟠",
    symbol: "ETH",
    isTestnet: false,
  },
  {
    key: "solana-devnet",
    name: "Solana Devnet",
    type: "solana",
    logo: "◎",
    symbol: "SOL",
    isTestnet: true,
  },
  {
    key: "solana-testnet",
    name: "Solana Testnet",
    type: "solana",
    logo: "◎",
    symbol: "SOL",
    isTestnet: true,
  },
];

export default function Bridge({
  walletAddress,
  walletAddresses,
  selectedChain,
  onChainChange,
  balance,
  seedPhrase,
  onLogout,
  onNavigateToSwap,
  onNavigateToHistory,
  onNavigateToDashboard,
  onNavigateToBridge,
  onNavigateToPools,
  onNavigateToAIPools,
  onNavigateToSend,
}: BridgeProps) {
  const [fromNetwork, setFromNetwork] = useState<NetworkKey>("sepolia");
  const [toNetwork, setToNetwork] = useState<NetworkKey>("solana-devnet");
  const [amount, setAmount] = useState<string>("");
  const [isBridging, setIsBridging] = useState<boolean>(false);
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [bridgeQuote, setBridgeQuote] = useState<{
    fee: string;
    receiveAmount: string;
  } | null>(null);
  const [txResult, setTxResult] = useState<{
    hash: string;
    network: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [fromBalance, setFromBalance] = useState<string>("0");
  const [toBalance, setToBalance] = useState<string>("0");
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);

  const fromNetworkOption = networkOptions.find((n) => n.key === fromNetwork)!;
  const toNetworkOption = networkOptions.find((n) => n.key === toNetwork)!;

  useEffect(() => {
    const fetchBalances = async () => {
      if (!seedPhrase) return;
      try {
        if (fromNetworkOption.type === "evm") {
          const evmService = new EVMWalletService(
            seedPhrase,
            fromNetwork as "sepolia" | "ethereum"
          );
          const bal = await evmService.getBalance();
          setFromBalance(bal);
          evmService.dispose();
        } else {
          const solanaService = new SolanaWalletService(
            seedPhrase,
            fromNetwork as "solana-devnet" | "solana-testnet"
          );
          const bal = await solanaService.getBalance();
          setFromBalance(bal);
          solanaService.dispose();
        }

        if (toNetworkOption.type === "evm") {
          const evmService = new EVMWalletService(
            seedPhrase,
            toNetwork as "sepolia" | "ethereum"
          );
          const bal = await evmService.getBalance();
          setToBalance(bal);
          evmService.dispose();
        } else {
          const solanaService = new SolanaWalletService(
            seedPhrase,
            toNetwork as "solana-devnet" | "solana-testnet"
          );
          const bal = await solanaService.getBalance();
          setToBalance(bal);
          solanaService.dispose();
        }
      } catch (err) {
        console.error("Error fetching balances:", err);
      }
    };
    fetchBalances();
  }, [fromNetwork, toNetwork, seedPhrase]);

  useEffect(() => {
    const getQuote = async () => {
      if (!amount || parseFloat(amount) <= 0 || !seedPhrase) {
        setBridgeQuote(null);
        return;
      }
      try {
        setIsQuoting(true);
        setError("");
        const bridgeFeePercent = 0.003;
        const networkFee = fromNetworkOption.type === "evm" ? 0.001 : 0.00001;
        const amountNum = parseFloat(amount);
        const bridgeFee = amountNum * bridgeFeePercent;
        const totalFee = bridgeFee + networkFee;
        const receiveAmount = amountNum - totalFee;

        setBridgeQuote({
          fee: totalFee.toFixed(6),
          receiveAmount: receiveAmount > 0 ? receiveAmount.toFixed(6) : "0",
        });
        setIsQuoting(false);
      } catch (err: any) {
        console.error("Error getting bridge quote:", err);
        setError("Failed to get bridge quote");
        setBridgeQuote(null);
        setIsQuoting(false);
      }
    };
    const debounceTimer = setTimeout(getQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, fromNetwork, toNetwork, seedPhrase]);

  const handleNetworkSwitch = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const handleMaxClick = () => {
    setAmount(fromBalance);
  };

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > parseFloat(fromBalance)) {
      setError("Insufficient balance");
      return;
    }

    const isCrossChain = fromNetworkOption.type !== toNetworkOption.type;
    if (isCrossChain) {
      const confirmBridge = confirm(
        "⚠️ CROSS-CHAIN BRIDGE\n\n" +
          "You are bridging from " +
          fromNetworkOption.name +
          " to " +
          toNetworkOption.name +
          ".\n\n" +
          "This feature requires a bridge protocol.\n" +
          "Currently, this is a DEMO.\n\n" +
          "Continue with demo?"
      );
      if (!confirmBridge) return;
    }

    if (fromNetworkOption.isTestnet) {
      const confirmTestnet = confirm(
        "🧪 TESTNET TRANSACTION\n\n" +
          "You are using " +
          fromNetworkOption.name +
          ".\n" +
          "These tokens have no real value.\n\n" +
          "Continue?"
      );
      if (!confirmTestnet) return;
    }

    try {
      setIsBridging(true);
      setError("");
      setTxResult(null);

      if (fromNetworkOption.type === "evm") {
        const evmService = new EVMWalletService(
          seedPhrase,
          fromNetwork as "sepolia" | "ethereum"
        );
        const fromAddress = await evmService.getAddress();
        const quote = await evmService.quoteSendTransaction(
          fromAddress,
          amount
        );
        console.log("Bridge Step 1 - Lock tokens:", {
          from: fromAddress,
          amount,
          fee: quote.fee.toString(),
          network: fromNetwork,
        });
        setTxResult({
          hash: "0x" + Date.now().toString(16) + "...demo",
          network: fromNetworkOption.name,
        });
        evmService.dispose();
      } else {
        const solanaService = new SolanaWalletService(
          seedPhrase,
          fromNetwork as "solana-devnet" | "solana-testnet"
        );
        const fromAddress = await solanaService.getAddress();
        const quote = await solanaService.quoteSendTransaction(
          fromAddress,
          amount
        );
        console.log("Bridge Step 1 - Lock tokens:", {
          from: fromAddress,
          amount,
          fee: quote.fee.toString(),
          network: fromNetwork,
        });
        setTxResult({
          hash: Date.now().toString() + "...demo",
          network: fromNetworkOption.name,
        });
        solanaService.dispose();
      }

      setIsBridging(false);
      setAmount("");
      setBridgeQuote(null);
    } catch (err: any) {
      console.error("Bridge failed:", err);
      setError(err.message || "Bridge transaction failed");
      setIsBridging(false);
    }
  };

  const getExplorerUrl = (hash: string, network: NetworkKey) => {
    const config = NETWORKS[network];
    if (network.startsWith("solana")) {
      const cluster =
        network === "solana-devnet"
          ? "?cluster=devnet"
          : network === "solana-testnet"
          ? "?cluster=testnet"
          : "";
      return config.explorer + "/tx/" + hash + cluster;
    }
    return config.explorer + "/tx/" + hash;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a1e 0%, #1a1a2e 100%)",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Navbar
        walletAddress={walletAddress}
        walletAddresses={walletAddresses}
        selectedChain={selectedChain}
        onChainChange={onChainChange}
        balance={balance}
        seedPhrase={seedPhrase}
        onLogout={onLogout}
        onNavigateToSwap={onNavigateToSwap}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToBridge={onNavigateToBridge}
        onNavigateToPools={onNavigateToPools}
        onNavigateToAIPools={onNavigateToAIPools}
        onNavigateToSend={onNavigateToSend}
        currentPage="bridge"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px",
        }}
      >
        <div style={{ maxWidth: "540px", width: "100%" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowRightLeft size={28} color="#667eea" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: 0,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Cross-Chain Bridge
              </h1>
              <p
                style={{ fontSize: "14px", color: "#999", margin: "4px 0 0 0" }}
              >
                Transfer assets across blockchain networks
              </p>
            </div>
          </div>

          {/* Success Result */}
          {txResult && (
            <div
              style={{
                background: "rgba(0, 230, 118, 0.1)",
                border: "1px solid rgba(0, 230, 118, 0.3)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <CheckCircle2 size={24} color="#00E676" />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#00E676",
                  }}
                >
                  Bridge Transaction Initiated!
                </span>
              </div>
              <div
                style={{ fontSize: "14px", color: "#999", marginBottom: "8px" }}
              >
                Transaction on {txResult.network}:
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <code
                  style={{
                    fontSize: "12px",
                    color: "#fff",
                    flex: 1,
                    wordBreak: "break-all",
                  }}
                >
                  {txResult.hash}
                </code>
                <a
                  href={getExplorerUrl(txResult.hash, fromNetwork)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#00E676" }}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "rgba(102, 126, 234, 0.1)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#667eea",
                }}
              >
                ⏳ In a real bridge, tokens would arrive on{" "}
                {toNetworkOption.name} in 2-20 minutes.
              </div>
            </div>
          )}

          {/* Main Bridge Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "32px",
              marginBottom: "24px",
            }}
          >
            {/* From Network */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#999",
                  marginBottom: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                From Network
              </label>
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setShowFromDropdown(!showFromDropdown)}
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "rgba(102, 126, 234, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      {fromNetworkOption.logo}
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "600" }}>
                        {fromNetworkOption.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Balance: {fromBalance} {fromNetworkOption.symbol}
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={20} color="#666" />
                </div>
                {showFromDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "rgba(20, 20, 35, 0.98)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      marginTop: "8px",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    {networkOptions
                      .filter((n) => n.key !== toNetwork)
                      .map((network) => (
                        <div
                          key={network.key}
                          onClick={() => {
                            setFromNetwork(network.key);
                            setShowFromDropdown(false);
                          }}
                          style={{
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            background:
                              fromNetwork === network.key
                                ? "rgba(102, 126, 234, 0.1)"
                                : "transparent",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>
                            {network.logo}
                          </span>
                          <span>{network.name}</span>
                          {network.isTestnet && (
                            <span
                              style={{
                                background: "rgba(255, 107, 0, 0.2)",
                                color: "#FF6B00",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "600",
                              }}
                            >
                              TESTNET
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Switch Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0",
              }}
            >
              <button
                onClick={handleNetworkSwitch}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(102, 126, 234, 0.1)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <ArrowRightLeft size={20} color="#667eea" />
              </button>
            </div>

            {/* To Network */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#999",
                  marginBottom: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                To Network
              </label>
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setShowToDropdown(!showToDropdown)}
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "rgba(102, 126, 234, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      {toNetworkOption.logo}
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "600" }}>
                        {toNetworkOption.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Balance: {toBalance} {toNetworkOption.symbol}
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={20} color="#666" />
                </div>
                {showToDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "rgba(20, 20, 35, 0.98)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      marginTop: "8px",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    {networkOptions
                      .filter((n) => n.key !== fromNetwork)
                      .map((network) => (
                        <div
                          key={network.key}
                          onClick={() => {
                            setToNetwork(network.key);
                            setShowToDropdown(false);
                          }}
                          style={{
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            background:
                              toNetwork === network.key
                                ? "rgba(102, 126, 234, 0.1)"
                                : "transparent",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>
                            {network.logo}
                          </span>
                          <span>{network.name}</span>
                          {network.isTestnet && (
                            <span
                              style={{
                                background: "rgba(255, 107, 0, 0.2)",
                                color: "#FF6B00",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "600",
                              }}
                            >
                              TESTNET
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#999",
                  marginBottom: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Amount
              </label>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "32px",
                      fontWeight: "700",
                      width: "60%",
                      outline: "none",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <button
                      onClick={handleMaxClick}
                      style={{
                        background: "rgba(102, 126, 234, 0.2)",
                        border: "1px solid rgba(102, 126, 234, 0.4)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        color: "#667eea",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      MAX
                    </button>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(255, 255, 255, 0.05)",
                        padding: "8px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <span style={{ fontSize: "16px", fontWeight: "700" }}>
                        {fromNetworkOption.symbol}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  <span>
                    Balance: {fromBalance} {fromNetworkOption.symbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Bridge Quote */}
            {bridgeQuote && (
              <div
                style={{
                  background: "rgba(102, 126, 234, 0.05)",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "#999" }}>Bridge Fee</span>
                  <span style={{ fontWeight: "600" }}>
                    {bridgeQuote.fee} {fromNetworkOption.symbol}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "#999" }}>Estimated Time</span>
                  <span style={{ fontWeight: "600", color: "#667eea" }}>
                    2-20 minutes
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <span style={{ color: "#999" }}>You will receive</span>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      color: "#00E676",
                    }}
                  >
                    ~{bridgeQuote.receiveAmount} {toNetworkOption.symbol}
                  </span>
                </div>
              </div>
            )}

            {isQuoting && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "24px",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Getting bridge quote...
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(255, 82, 82, 0.1)",
                  border: "1px solid rgba(255, 82, 82, 0.3)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <AlertCircle size={20} color="#FF5252" />
                <span style={{ color: "#FF5252", fontSize: "14px" }}>
                  {error}
                </span>
              </div>
            )}

            {/* Bridge Button */}
            <button
              onClick={handleBridge}
              disabled={
                !amount || parseFloat(amount) <= 0 || isBridging || isQuoting
              }
              style={{
                width: "100%",
                background:
                  !amount || parseFloat(amount) <= 0 || isBridging
                    ? "rgba(102, 126, 234, 0.3)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "16px",
                padding: "18px",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "700",
                cursor:
                  !amount || parseFloat(amount) <= 0 || isBridging
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.2s",
                fontFamily: "'Space Grotesk', sans-serif",
                opacity:
                  !amount || parseFloat(amount) <= 0 || isBridging ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isBridging ? (
                <>
                  <Loader2
                    size={20}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Bridging...
                </>
              ) : (
                "Bridge Tokens"
              )}
            </button>
          </div>

          {/* Info Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "rgba(102, 126, 234, 0.05)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <Info size={18} color="#667eea" />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#667eea",
                  }}
                >
                  Cross-Chain
                </span>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#999",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                Bridge between EVM chains and Solana networks
              </p>
            </div>
            <div
              style={{
                background: "rgba(255, 184, 0, 0.05)",
                border: "1px solid rgba(255, 184, 0, 0.2)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <AlertCircle size={18} color="#FFB800" />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#FFB800",
                  }}
                >
                  Testnet Mode
                </span>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#999",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                Use Sepolia and Solana Devnet for testing
              </p>
            </div>
          </div>

          {/* How Bridge Works */}
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Info size={16} color="#667eea" />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#667eea",
                }}
              >
                How Bridge Works
              </span>
            </div>
            <ul
              style={{
                fontSize: "13px",
                color: "#999",
                lineHeight: "1.8",
                margin: 0,
                paddingLeft: "20px",
              }}
            >
              <li>Tokens are locked on the source chain</li>
              <li>Bridge validators verify the transaction</li>
              <li>Equivalent tokens are minted on the destination chain</li>
              <li>Process takes 2-20 minutes</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
