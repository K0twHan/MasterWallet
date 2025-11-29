import { useState } from "react";
import Navbar from "./Navbar";
import {
  History as HistoryIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ExternalLink,
  Filter,
  Search,
} from "lucide-react";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface HistoryProps {
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

interface Transaction {
  id: string;
  type: "received" | "sent" | "swap";
  amount: string;
  token: string;
  address?: string;
  swapDetails?: {
    from: string;
    to: string;
    fromAmount: string;
    toAmount: string;
  };
  timestamp: string;
  status: "completed" | "pending" | "failed";
  txHash: string;
  fee: string;
}

export default function History({
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
}: HistoryProps) {
  const [filterType, setFilterType] = useState<
    "all" | "received" | "sent" | "swap"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Mock transaction data - replace with real data from WDK
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "received",
      amount: "0.05",
      token: "ETH",
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f3a1f",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      txHash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      fee: "0.0001",
    },
    {
      id: "2",
      type: "sent",
      amount: "0.02",
      token: "ETH",
      address: "0x8f3b89e8c5a7d6b4e3f2c1a9d8e7f6c5b4a39c2e",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      txHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      fee: "0.00015",
    },
    {
      id: "3",
      type: "swap",
      amount: "0.01",
      token: "ETH",
      swapDetails: {
        from: "ETH",
        to: "USDT",
        fromAmount: "0.01",
        toAmount: "24.5",
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      txHash:
        "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      fee: "0.0002",
    },
    {
      id: "4",
      type: "received",
      amount: "0.15",
      token: "ETH",
      address: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      txHash:
        "0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff",
      fee: "0.00012",
    },
    {
      id: "5",
      type: "sent",
      amount: "0.08",
      token: "ETH",
      address: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      txHash:
        "0xaaabbbcccdddeeefffaaabbbcccdddeeefffaaabbbcccdddeeefffaaabbbcccc",
      fee: "0.00018",
    },
    {
      id: "6",
      type: "swap",
      amount: "50",
      token: "USDT",
      swapDetails: {
        from: "USDT",
        to: "ETH",
        fromAmount: "50",
        toAmount: "0.02",
      },
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      txHash:
        "0x9999888877776666555544443333222211110000ffffeeeedddccccbbbbaaa",
      fee: "0.00025",
    },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filterType === "all" || tx.type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      tx.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Less than an hour ago";
    if (diffHours < 24)
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "received":
        return <ArrowDownLeft size={20} color="#00E676" />;
      case "sent":
        return <ArrowUpRight size={20} color="#FF6B00" />;
      case "swap":
        return <ArrowLeftRight size={20} color="#667eea" />;
      default:
        return <HistoryIcon size={20} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "received":
        return "#00E676";
      case "sent":
        return "#FF6B00";
      case "swap":
        return "#667eea";
      default:
        return "#999";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a1e 0%, #1a1a2e 100%)",
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
        currentPage="history"
      />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
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
              background: "rgba(255, 107, 0, 0.1)",
              border: "1px solid rgba(255, 107, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HistoryIcon size={28} color="#FF6B00" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
                color: "#fff",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Transaction History
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#999",
                margin: "4px 0 0 0",
              }}
            >
              View and manage all your wallet transactions
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              position: "relative",
              marginBottom: "20px",
            }}
          >
            <Search
              size={18}
              color="#666"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search by address or transaction hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "14px 16px 14px 48px",
                color: "#fff",
                fontSize: "14px",
                fontFamily:
                  "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Filter size={18} color="#666" />
            <span
              style={{
                fontSize: "13px",
                color: "#666",
                fontWeight: "600",
                marginRight: "8px",
              }}
            >
              Filter:
            </span>
            {(["all", "received", "sent", "swap"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  background:
                    filterType === type
                      ? "#FF6B00"
                      : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${
                    filterType === type ? "#FF6B00" : "rgba(255, 255, 255, 0.1)"
                  }`,
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: filterType === type ? "#fff" : "#999",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {filteredTransactions.length === 0 ? (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <HistoryIcon
                size={48}
                color="#333"
                style={{ marginBottom: "16px" }}
              />
              <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
                No transactions found
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = getTransactionColor(
                    tx.type
                  );
                  e.currentTarget.style.background = `${getTransactionColor(
                    tx.type
                  )}10`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.03)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: `${getTransactionColor(tx.type)}15`,
                      border: `1px solid ${getTransactionColor(tx.type)}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#fff",
                          textTransform: "capitalize",
                          fontFamily:
                            "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                        {tx.type}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background:
                            tx.status === "completed"
                              ? "rgba(0, 230, 118, 0.15)"
                              : "rgba(255, 184, 0, 0.15)",
                          color:
                            tx.status === "completed" ? "#00E676" : "#FFB800",
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontFamily:
                          "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                        fontWeight: "500",
                      }}
                    >
                      {tx.type === "swap" && tx.swapDetails
                        ? `${tx.swapDetails.fromAmount} ${tx.swapDetails.from} → ${tx.swapDetails.toAmount} ${tx.swapDetails.to}`
                        : tx.address
                        ? formatAddress(tx.address)
                        : formatDate(tx.timestamp)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: getTransactionColor(tx.type),
                      marginBottom: "4px",
                      fontFamily:
                        "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {tx.type === "received"
                      ? "+"
                      : tx.type === "sent"
                      ? "-"
                      : ""}
                    {tx.amount} {tx.token}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    {formatDate(tx.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setSelectedTx(null)}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(20, 20, 35, 0.98) 0%, rgba(15, 15, 30, 0.98) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
                paddingBottom: "24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: `${getTransactionColor(selectedTx.type)}15`,
                  border: `1px solid ${getTransactionColor(selectedTx.type)}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {getTransactionIcon(selectedTx.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    margin: 0,
                    color: "#fff",
                    textTransform: "capitalize",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: "-0.02em",
                    marginBottom: "4px",
                  }}
                >
                  {selectedTx.type} Transaction
                </h2>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  {formatDate(selectedTx.timestamp)}
                </div>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background:
                    selectedTx.status === "completed"
                      ? "rgba(0, 230, 118, 0.15)"
                      : "rgba(255, 184, 0, 0.15)",
                  color:
                    selectedTx.status === "completed" ? "#00E676" : "#FFB800",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {selectedTx.status}
              </div>
            </div>

            {/* Amount */}
            <div
              style={{
                background: `${getTransactionColor(selectedTx.type)}10`,
                border: `1px solid ${getTransactionColor(selectedTx.type)}30`,
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "8px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Amount
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: getTransactionColor(selectedTx.type),
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "-0.03em",
                }}
              >
                {selectedTx.type === "received"
                  ? "+"
                  : selectedTx.type === "sent"
                  ? "-"
                  : ""}
                {selectedTx.amount} {selectedTx.token}
              </div>
            </div>

            {/* Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              {selectedTx.type === "swap" && selectedTx.swapDetails ? (
                <>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "8px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      Swap Details
                    </div>
                    <div
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        padding: "16px",
                        fontSize: "14px",
                        color: "#fff",
                        fontFamily:
                          "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                        fontWeight: "500",
                      }}
                    >
                      {selectedTx.swapDetails.fromAmount}{" "}
                      {selectedTx.swapDetails.from} →{" "}
                      {selectedTx.swapDetails.toAmount}{" "}
                      {selectedTx.swapDetails.to}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "8px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedTx.type === "received" ? "From" : "To"}
                  </div>
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
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#fff",
                        fontFamily:
                          "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                        fontWeight: "500",
                      }}
                    >
                      {selectedTx.address}
                    </span>
                    <button
                      onClick={() =>
                        selectedTx.address &&
                        copyToClipboard(selectedTx.address)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#FF6B00",
                        cursor: "pointer",
                        padding: "4px",
                        fontSize: "12px",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "8px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Transaction Hash
                </div>
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
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#fff",
                      fontFamily:
                        "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                      fontWeight: "500",
                      wordBreak: "break-all",
                    }}
                  >
                    {formatAddress(selectedTx.txHash)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedTx.txHash)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#FF6B00",
                      cursor: "pointer",
                      padding: "4px",
                      fontSize: "12px",
                      marginLeft: "8px",
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "8px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Network Fee
                </div>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "16px",
                    fontSize: "14px",
                    color: "#fff",
                  }}
                >
                  {selectedTx.fee} ETH
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <button
                onClick={() =>
                  window.open(
                    `https://etherscan.io/tx/${selectedTx.txHash}`,
                    "_blank"
                  )
                }
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                <ExternalLink size={16} />
                View on Etherscan
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "14px",
                  borderRadius: "12px",
                  color: "#999",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
