import { useState, useEffect } from "react";
import {
  Send,
  ArrowRight,
  Loader2,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Settings,
} from "lucide-react";
import Navbar from "./Navbar";
import {
  EVMWalletService,
  SolanaWalletService,
  NETWORKS,
  isValidEVMAddress,
  isValidSolanaAddress,
  shortenAddress,
  TOKEN_DECIMALS,
} from "../services/walletService";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface SendProps {
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

type NetworkType =
  | "sepolia"
  | "ethereum"
  | "solana-testnet"
  | "solana-devnet"
  | "solana-mainnet";
type TokenType = "native" | "token";

export default function SendComponent({
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
}: SendProps) {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [network, setNetwork] = useState<NetworkType>("sepolia");
  const [tokenType] = useState<TokenType>("native");
  const [selectedToken] = useState<string>("ETH");
  const [tokenAddress] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [quote, setQuote] = useState<{ fee: bigint } | null>(null);
  const [txResult, setTxResult] = useState<{
    hash: string;
    fee: bigint;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [currentBalance, setCurrentBalance] = useState<string>(balance);

  const isEVMNetwork = network === "sepolia" || network === "ethereum";
  const isSolanaNetwork = network.startsWith("solana");

  // Get native currency symbol
  const nativeSymbol = isEVMNetwork ? "ETH" : "SOL";
  const networkConfig = NETWORKS[network];

  // Update balance when network changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!seedPhrase) return;

      try {
        if (isEVMNetwork) {
          const evmService = new EVMWalletService(
            seedPhrase,
            network as "sepolia" | "ethereum"
          );
          const bal = await evmService.getBalance();
          setCurrentBalance(bal);
          evmService.dispose();
        } else if (isSolanaNetwork) {
          const solanaService = new SolanaWalletService(
            seedPhrase,
            network as "solana-testnet" | "solana-devnet" | "solana-mainnet"
          );
          const bal = await solanaService.getBalance();
          setCurrentBalance(bal);
          solanaService.dispose();
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
        setCurrentBalance("0");
      }
    };

    fetchBalance();
  }, [network, seedPhrase]);

  // Get quote when inputs change
  useEffect(() => {
    const getQuote = async () => {
      if (!recipient || !amount || parseFloat(amount) <= 0 || !seedPhrase) {
        setQuote(null);
        return;
      }

      // Validate address
      if (isEVMNetwork && !isValidEVMAddress(recipient)) {
        return;
      }
      if (isSolanaNetwork && !isValidSolanaAddress(recipient)) {
        return;
      }

      try {
        setIsQuoting(true);
        setError("");

        if (isEVMNetwork) {
          const evmService = new EVMWalletService(
            seedPhrase,
            network as "sepolia" | "ethereum"
          );

          if (tokenType === "native") {
            const q = await evmService.quoteSendTransaction(recipient, amount);
            setQuote(q);
          } else if (tokenAddress) {
            const decimals = TOKEN_DECIMALS[selectedToken] || 18;
            const amountInBase = BigInt(
              Math.floor(parseFloat(amount) * Math.pow(10, decimals))
            );
            const q = await evmService.quoteTransfer(
              tokenAddress,
              recipient,
              amountInBase
            );
            setQuote(q);
          }

          evmService.dispose();
        } else if (isSolanaNetwork) {
          const solanaService = new SolanaWalletService(
            seedPhrase,
            network as "solana-testnet" | "solana-devnet" | "solana-mainnet"
          );

          if (tokenType === "native") {
            const q = await solanaService.quoteSendTransaction(
              recipient,
              amount
            );
            setQuote(q);
          }

          solanaService.dispose();
        }

        setIsQuoting(false);
      } catch (err: any) {
        console.error("Error getting quote:", err);
        setQuote(null);
        setIsQuoting(false);
      }
    };

    const debounceTimer = setTimeout(getQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [recipient, amount, network, tokenType, tokenAddress, seedPhrase]);

  const handleSend = async () => {
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      setError("Please enter valid recipient and amount");
      return;
    }

    // Validate address
    if (isEVMNetwork && !isValidEVMAddress(recipient)) {
      setError(
        "Invalid Ethereum address. Must start with 0x and be 42 characters."
      );
      return;
    }
    if (isSolanaNetwork && !isValidSolanaAddress(recipient)) {
      setError("Invalid Solana address.");
      return;
    }

    // Check if user has enough balance
    const amountFloat = parseFloat(amount);
    const balanceFloat = parseFloat(currentBalance);
    
    if (tokenType === "native" && amountFloat > balanceFloat) {
      setError(`Insufficient balance. You have ${balanceFloat} ${nativeSymbol}`);
      return;
    }

    // Confirm testnet transaction
    if (
      network === "sepolia" ||
      network === "solana-testnet" ||
      network === "solana-devnet"
    ) {
      const confirmTestnet = confirm(
        `🧪 TESTNET TRANSACTION\n\n` +
          `You are about to send ${amount} ${nativeSymbol} on ${networkConfig.name}.\n\n` +
          `This is test currency with no real value.\n\n` +
          `Continue?`
      );
      if (!confirmTestnet) return;
    }

    try {
      setIsSending(true);
      setError("");
      setTxResult(null);

      if (isEVMNetwork) {
        const evmService = new EVMWalletService(
          seedPhrase,
          network as "sepolia" | "ethereum"
        );

        let result;
        if (tokenType === "native") {
          // Send native ETH using WDK's sendTransaction
          result = await evmService.sendTransaction(recipient, amount);
        } else if (tokenAddress) {
          // Send ERC-20 tokens using WDK's transfer
          const decimals = TOKEN_DECIMALS[selectedToken] || 18;
          const amountInBase = BigInt(
            Math.floor(parseFloat(amount) * Math.pow(10, decimals))
          );
          result = await evmService.transferToken(
            tokenAddress,
            recipient,
            amountInBase
          );
        }

        if (result) {
          setTxResult({ hash: result.hash, fee: result.fee });
          
          // Refresh balance after successful transaction
          setTimeout(async () => {
            const bal = await evmService.getBalance();
            setCurrentBalance(bal);
          }, 2000);
        }

        evmService.dispose();
      } else if (isSolanaNetwork) {
        const solanaService = new SolanaWalletService(
          seedPhrase,
          network as "solana-testnet" | "solana-devnet" | "solana-mainnet"
        );

        let result;
        if (tokenType === "native") {
          result = await solanaService.sendTransaction(recipient, amount);
        } else if (tokenAddress) {
          const decimals = TOKEN_DECIMALS[selectedToken] || 9;
          const amountInBase = BigInt(
            Math.floor(parseFloat(amount) * Math.pow(10, decimals))
          );
          result = await solanaService.transferToken(
            tokenAddress,
            recipient,
            amountInBase
          );
        }

        if (result) {
          setTxResult({ hash: result.hash, fee: result.fee });
          
          // Refresh balance after successful transaction
          setTimeout(async () => {
            const bal = await solanaService.getBalance();
            setCurrentBalance(bal);
          }, 2000);
        }

        solanaService.dispose();
      }

      setIsSending(false);
      setAmount("");
      setRecipient("");
      setQuote(null);
    } catch (err: any) {
      console.error("Send failed:", err);
      
      // Better error messages
      let errorMessage = "Transaction failed. Please try again.";
      
      if (err.message?.includes("insufficient funds")) {
        errorMessage = `Insufficient funds. You need more ${nativeSymbol} for gas fees.`;
      } else if (err.message?.includes("exceeds balance")) {
        errorMessage = `Amount exceeds your balance of ${currentBalance} ${nativeSymbol}`;
      } else if (err.message?.includes("gas")) {
        errorMessage = "Gas estimation failed. Check your balance and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSending(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  const getExplorerUrl = (hash: string) => {
    if (isEVMNetwork) {
      return `${networkConfig.explorer}/tx/${hash}`;
    } else {
      const cluster =
        network === "solana-mainnet"
          ? ""
          : `?cluster=${network.replace("solana-", "")}`;
      return `${networkConfig.explorer}/tx/${hash}${cluster}`;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Navbar
        walletAddress={walletAddress}
        walletAddresses={walletAddresses}
        selectedChain={selectedChain}
        onChainChange={onChainChange}
        balance={currentBalance}
        seedPhrase={seedPhrase}
        onLogout={onLogout}
        onNavigateToSwap={onNavigateToSwap}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToBridge={onNavigateToBridge}
        onNavigateToPools={onNavigateToPools}
        onNavigateToAIPools={onNavigateToAIPools}
        currentPage="send"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px",
        }}
      >
        <div style={{ maxWidth: "520px", width: "100%" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(0, 230, 118, 0.1)",
                  border: "1px solid rgba(0, 230, 118, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={28} color="#00E676" />
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
                  Send
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#999",
                    margin: "4px 0 0 0",
                  }}
                >
                  Transfer tokens to any address
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "12px",
                color: "#999",
                cursor: "pointer",
              }}
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div
              style={{
                background: "rgba(20, 20, 35, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Network
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "8px",
                  }}
                >
                  {(
                    [
                      "sepolia",
                      "ethereum",
                      "solana-devnet",
                      "solana-testnet",
                    ] as NetworkType[]
                  ).map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetwork(net)}
                      style={{
                        background:
                          network === net
                            ? "rgba(0, 230, 118, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                        border:
                          network === net
                            ? "1px solid #00E676"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "10px",
                        color: network === net ? "#00E676" : "#fff",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {NETWORKS[net].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                  Transaction Sent!
                </span>
              </div>
              <div
                style={{ fontSize: "14px", color: "#999", marginBottom: "8px" }}
              >
                Transaction Hash:
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "12px",
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
                  href={getExplorerUrl(txResult.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#00E676" }}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <div style={{ fontSize: "13px", color: "#666" }}>
                Fee:{" "}
                {(Number(txResult.fee) / (isEVMNetwork ? 1e18 : 1e9)).toFixed(
                  6
                )}{" "}
                {nativeSymbol}
              </div>
            </div>
          )}

          {/* Main Send Card */}
          <div
            style={{
              background: "rgba(20, 20, 35, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "24px",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* From Section */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#999",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                From
              </label>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    {shortenAddress(walletAddress)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Balance: {currentBalance} {nativeSymbol}
                  </div>
                </div>
                <button
                  onClick={handleCopyAddress}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px",
                    cursor: "pointer",
                    color: "#999",
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {/* To Section */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#999",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                To
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={isEVMNetwork ? "0x..." : "Solana address..."}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "16px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {recipient && (
                <div style={{ marginTop: "4px", fontSize: "12px" }}>
                  {isEVMNetwork && isValidEVMAddress(recipient) && (
                    <span style={{ color: "#00E676" }}>
                      ✓ Valid Ethereum address
                    </span>
                  )}
                  {isEVMNetwork && !isValidEVMAddress(recipient) && (
                    <span style={{ color: "#FF5252" }}>
                      ✗ Invalid Ethereum address
                    </span>
                  )}
                  {isSolanaNetwork && isValidSolanaAddress(recipient) && (
                    <span style={{ color: "#00E676" }}>
                      ✓ Valid Solana address
                    </span>
                  )}
                  {isSolanaNetwork && !isValidSolanaAddress(recipient) && (
                    <span style={{ color: "#FF5252" }}>
                      ✗ Invalid Solana address
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Amount Section */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#999",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Amount
              </label>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "24px",
                      fontWeight: "600",
                      outline: "none",
                    }}
                  />
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {nativeSymbol}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  <span>
                    Balance: {currentBalance} {nativeSymbol}
                  </span>
                  <button
                    onClick={() => setAmount(currentBalance)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#00E676",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Fee Quote */}
            {quote && (
              <div
                style={{
                  background: "rgba(0, 230, 118, 0.05)",
                  border: "1px solid rgba(0, 230, 118, 0.1)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "#999" }}>Estimated Fee</span>
                  <span style={{ fontWeight: "600" }}>
                    {(Number(quote.fee) / (isEVMNetwork ? 1e18 : 1e9)).toFixed(
                      6
                    )}{" "}
                    {nativeSymbol}
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
                  marginBottom: "20px",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Getting fee estimate...
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
                  marginBottom: "20px",
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

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={
                !recipient ||
                !amount ||
                parseFloat(amount) <= 0 ||
                isSending ||
                isQuoting
              }
              style={{
                width: "100%",
                background:
                  !recipient || !amount || parseFloat(amount) <= 0 || isSending
                    ? "rgba(0, 230, 118, 0.3)"
                    : "linear-gradient(135deg, #00E676 0%, #00C853 100%)",
                border: "none",
                borderRadius: "16px",
                padding: "18px",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "700",
                cursor:
                  !recipient || !amount || parseFloat(amount) <= 0 || isSending
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              {isSending ? (
                <>
                  <Loader2
                    size={20}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Network Info */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#666",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              Current Network:{" "}
              <strong
                style={{
                  color:
                    network.includes("testnet") ||
                    network.includes("devnet") ||
                    network === "sepolia"
                      ? "#FF6B00"
                      : "#00E676",
                }}
              >
                {networkConfig.name}
              </strong>
            </div>
            {(network === "sepolia" ||
              network.includes("testnet") ||
              network.includes("devnet")) && (
              <div style={{ color: "#FF6B00" }}>
                ⚠️ This is a testnet. Tokens have no real value.
              </div>
            )}
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
