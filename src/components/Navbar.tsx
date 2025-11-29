import { useState, useRef, useEffect } from "react";
import {
  Copy,
  LogOut,
  Download,
  Upload,
  Key,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  History,
  BookOpen,
} from "lucide-react";
import WalletSelector from "./WalletSelector";
import AddressBook from "./AddressBook";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface NavbarProps {
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
  currentPage:
    | "dashboard"
    | "swap"
    | "bridge"
    | "history"
    | "pools"
    | "ai-pools"
    | "send";
}

export default function Navbar({
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
  currentPage,
}: NavbarProps) {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [tradeDropdownOpen, setTradeDropdownOpen] = useState(false);
  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [seedRevealed, setSeedRevealed] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  const tradeDropdownRef = useRef<HTMLDivElement>(null);
  const portfolioDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWalletDropdownOpen(false);
      }
      if (
        tradeDropdownRef.current &&
        !tradeDropdownRef.current.contains(event.target as Node)
      ) {
        setTradeDropdownOpen(false);
      }
      if (
        portfolioDropdownRef.current &&
        !portfolioDropdownRef.current.contains(event.target as Node)
      ) {
        setPortfolioDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    alert("Address copied to clipboard!");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isTradeActive = currentPage === "swap" || currentPage === "bridge";
  const isPortfolioActive = currentPage === "history";

  return (
    <>
      <nav
        style={{
          background: "rgba(15, 15, 30, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: "0 0 auto",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#FF6B00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "20px",
              borderRadius: "8px",
            }}
          >
            W
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#fff",
              fontFamily:
                "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            WDK Wallet
          </span>
        </div>

        {/* Center Navigation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {/* Dashboard Button */}
          <button
            onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
            style={{
              background:
                currentPage === "dashboard"
                  ? "rgba(255, 107, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
              border:
                currentPage === "dashboard"
                  ? "1px solid #FF6B00"
                  : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: currentPage === "dashboard" ? "#FF6B00" : "#fff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily:
                "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: "-0.01em",
            }}
            onMouseOver={(e) => {
              if (currentPage !== "dashboard") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== "dashboard") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </button>

          {/* Trade Dropdown */}
          <div style={{ position: "relative" }} ref={tradeDropdownRef}>
            <button
              onClick={() => setTradeDropdownOpen(!tradeDropdownOpen)}
              style={{
                background: isTradeActive
                  ? "rgba(255, 107, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                border: isTradeActive
                  ? "1px solid #FF6B00"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: isTradeActive ? "#FF6B00" : "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: "-0.01em",
              }}
              onMouseOver={(e) => {
                if (!isTradeActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseOut={(e) => {
                if (!isTradeActive) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              Trade
              <ChevronDown size={16} />
            </button>

            {tradeDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "rgba(20, 20, 35, 0.98)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "8px",
                  minWidth: "180px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={() => {
                    onNavigateToSwap();
                    setTradeDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background:
                      currentPage === "swap"
                        ? "rgba(255, 107, 0, 0.1)"
                        : "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: currentPage === "swap" ? "#FF6B00" : "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== "swap") {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== "swap") {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <ArrowLeftRight size={16} />
                  Swap
                </button>

                <button
                  onClick={() => {
                    if (onNavigateToBridge) {
                      onNavigateToBridge();
                    } else {
                      alert("Bridge özelliği yakında gelecek");
                    }
                    setTradeDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background:
                      currentPage === "bridge"
                        ? "rgba(255, 107, 0, 0.1)"
                        : "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: currentPage === "bridge" ? "#FF6B00" : "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== "bridge") {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== "bridge") {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                  </svg>
                  Bridge
                </button>

                <button
                  onClick={() => {
                    if (onNavigateToSend) {
                      onNavigateToSend();
                    }
                    setTradeDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background:
                      currentPage === "send"
                        ? "rgba(255, 107, 0, 0.1)"
                        : "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: currentPage === "send" ? "#FF6B00" : "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== "send") {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== "send") {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Upload size={16} />
                  Send
                </button>
              </div>
            )}
          </div>

          {/* Pools Button */}
          <button
            onClick={() => onNavigateToPools?.()}
            style={{
              background:
                currentPage === "pools"
                  ? "rgba(255, 107, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
              border:
                currentPage === "pools"
                  ? "1px solid #FF6B00"
                  : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: currentPage === "pools" ? "#FF6B00" : "#fff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily:
                "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: "-0.01em",
            }}
            onMouseOver={(e) => {
              if (currentPage !== "pools") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== "pools") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }
            }}
          >
            Pools
          </button>

          {/* AI Pools Button */}
          <button
            onClick={() => onNavigateToAIPools?.()}
            style={{
              background:
                currentPage === "ai-pools"
                  ? "rgba(255, 107, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
              border:
                currentPage === "ai-pools"
                  ? "1px solid #FF6B00"
                  : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: currentPage === "ai-pools" ? "#FF6B00" : "#fff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily:
                "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: "-0.01em",
            }}
            onMouseOver={(e) => {
              if (currentPage !== "ai-pools") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== "ai-pools") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }
            }}
          >
            🤖 AI Pools
          </button>

          {/* Portfolio Dropdown */}
          <div style={{ position: "relative" }} ref={portfolioDropdownRef}>
            <button
              onClick={() => setPortfolioDropdownOpen(!portfolioDropdownOpen)}
              style={{
                background: isPortfolioActive
                  ? "rgba(255, 107, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                border: isPortfolioActive
                  ? "1px solid #FF6B00"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: isPortfolioActive ? "#FF6B00" : "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: "-0.01em",
              }}
              onMouseOver={(e) => {
                if (!isPortfolioActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseOut={(e) => {
                if (!isPortfolioActive) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              Portfolio
              <ChevronDown size={16} />
            </button>

            {portfolioDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "rgba(20, 20, 35, 0.98)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "8px",
                  minWidth: "180px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={() => {
                    onNavigateToHistory();
                    setPortfolioDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background:
                      currentPage === "history"
                        ? "rgba(255, 107, 0, 0.1)"
                        : "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: currentPage === "history" ? "#FF6B00" : "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== "history") {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== "history") {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <History size={16} />
                  History
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Network & Wallet */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flex: "0 0 auto",
          }}
        >
          {/* Multi-Chain Wallet Selector */}
          <WalletSelector
            wallets={walletAddresses}
            selectedChain={selectedChain}
            onChainChange={onChainChange}
          />

          {/* Wallet Dropdown */}
          <div style={{ position: "relative" }} ref={walletDropdownRef}>
            <button
              onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
              style={{
                background: "rgba(255, 107, 0, 0.2)",
                border: "1px solid #FF6B00",
                borderRadius: "12px",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 107, 0, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 107, 0, 0.2)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    fontWeight: "500",
                    fontFamily:
                      "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {selectedChain === "solana"
                    ? `${balance} SOL`
                    : selectedChain === "ethereum"
                    ? `${balance} ETH`
                    : ""}
                </span>
                <span
                  style={{
                    fontFamily:
                      "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                    fontWeight: "500",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatAddress(walletAddress)}
                </span>
              </div>
              {isWalletDropdownOpen ? (
                <ChevronUp size={16} color="#999" />
              ) : (
                <ChevronDown size={16} color="#999" />
              )}
            </button>

            {isWalletDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "rgba(20, 20, 35, 0.98)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "12px",
                  minWidth: "280px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                  zIndex: 1000,
                }}
              >
                {/* Wallet Info */}
                <div
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: "#999",
                        fontSize: "12px",
                        fontWeight: "500",
                        fontFamily:
                          "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Wallet Address
                    </span>
                    <button
                      onClick={copyAddress}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontFamily:
                          "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontWeight: "500",
                      }}
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      padding: "12px",
                      borderRadius: "8px",
                      fontFamily:
                        "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                      fontSize: "13px",
                      wordBreak: "break-all",
                      color: "#fff",
                      fontWeight: "500",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {walletAddress}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => {
                    setShowSeedModal(true);
                    setIsWalletDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Key size={18} color="#FF6B00" />
                  View Seed Phrase
                </button>

                <button
                  onClick={() => {
                    setShowDepositModal(true);
                    setIsWalletDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Download size={18} color="#00E676" />
                  Deposit
                </button>

                <button
                  onClick={() => {
                    setShowWithdrawModal(true);
                    setIsWalletDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Upload size={18} color="#FF6B00" />
                  Withdraw
                </button>

                <button
                  onClick={() => {
                    setShowAddressBook(true);
                    setIsWalletDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    transition: "all 0.2s",
                    marginBottom: "8px",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <BookOpen size={18} color="#00E676" />
                  Address Book
                </button>

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    marginTop: "8px",
                    paddingTop: "8px",
                  }}
                >
                  <button
                    onClick={() => {
                      onLogout();
                      setIsWalletDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      color: "#ff4444",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontFamily:
                        "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255, 68, 68, 0.1)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <LogOut size={18} />
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Seed Phrase Modal */}
      {showSeedModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowSeedModal(false)}
        >
          <div
            style={{
              background: "rgba(20, 20, 35, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <Key size={28} color="#FF6B00" />
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Secret Recovery Phrase
              </h2>
            </div>
            <p
              style={{
                color: "#999",
                fontSize: "14px",
                marginBottom: "24px",
                fontFamily:
                  "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Keep this phrase safe and never share it with anyone.
            </p>

            {!seedRevealed ? (
              <div
                style={{
                  background: "rgba(255, 107, 0, 0.1)",
                  border: "1px solid rgba(255, 107, 0, 0.3)",
                  borderRadius: "16px",
                  padding: "32px",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "rgba(255, 107, 0, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Key size={32} color="#FF6B00" />
                </div>
                <p
                  style={{
                    color: "#fff",
                    marginBottom: "20px",
                    fontSize: "14px",
                    fontFamily:
                      "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Click below to reveal your seed phrase
                </p>
                <button
                  onClick={() => setSeedRevealed(true)}
                  style={{
                    background: "#FF6B00",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Reveal Seed Phrase
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  {seedPhrase.split(" ").map((word, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        padding: "12px",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontFamily:
                          "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                        fontSize: "13px",
                        fontWeight: "500",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      <span
                        style={{
                          color: "#666",
                          fontSize: "10px",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {index + 1}
                      </span>
                      {word}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(seedPhrase);
                    alert("Seed phrase copied to clipboard!");
                  }}
                  style={{
                    width: "100%",
                    background: "rgba(255, 107, 0, 0.2)",
                    border: "1px solid #FF6B00",
                    padding: "12px",
                    borderRadius: "12px",
                    color: "#FF6B00",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontFamily:
                      "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  <Copy size={16} />
                  Copy to Clipboard
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowSeedModal(false);
                setSeedRevealed(false);
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "12px",
                borderRadius: "12px",
                color: "#999",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowDepositModal(false)}
        >
          <div
            style={{
              background: "rgba(20, 20, 35, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <Download size={28} color="#00E676" />
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Deposit ETH
              </h2>
            </div>
            <p
              style={{
                color: "#999",
                fontSize: "14px",
                marginBottom: "24px",
                fontFamily:
                  "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Send ETH to this address to deposit into your wallet
            </p>

            <div
              style={{
                background: "rgba(0, 230, 118, 0.1)",
                border: "1px solid rgba(0, 230, 118, 0.3)",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "16px",
                  borderRadius: "12px",
                  fontFamily:
                    "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                  fontSize: "13px",
                  wordBreak: "break-all",
                  marginBottom: "16px",
                  color: "#fff",
                  fontWeight: "500",
                  letterSpacing: "-0.02em",
                }}
              >
                {walletAddress}
              </div>
              <button
                onClick={copyAddress}
                style={{
                  background: "#00E676",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                <Copy size={16} />
                Copy Address
              </button>
            </div>

            <button
              onClick={() => setShowDepositModal(false)}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "12px",
                borderRadius: "12px",
                color: "#999",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            style={{
              background: "rgba(20, 20, 35, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <Upload size={28} color="#FF6B00" />
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Withdraw ETH
              </h2>
            </div>
            <p
              style={{
                color: "#999",
                fontSize: "14px",
                marginBottom: "24px",
                fontFamily:
                  "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Send ETH from your wallet to another address
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#999",
                  fontSize: "13px",
                  marginBottom: "8px",
                  fontWeight: "600",
                  fontFamily:
                    "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "14px",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily:
                    "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                  fontWeight: "500",
                  letterSpacing: "-0.02em",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#999",
                  fontSize: "13px",
                  marginBottom: "8px",
                  fontWeight: "600",
                  fontFamily:
                    "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Amount (ETH)
              </label>
              <input
                type="text"
                placeholder="0.0"
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "14px",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily:
                    "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                  fontWeight: "500",
                  letterSpacing: "-0.02em",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    fontFamily:
                      "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Available: {balance} ETH
                </span>
              </div>
            </div>

            <button
              onClick={() => alert("Withdraw functionality coming soon!")}
              style={{
                width: "100%",
                background: "#FF6B00",
                border: "none",
                padding: "14px",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "12px",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Send Transaction
            </button>

            <button
              onClick={() => setShowWithdrawModal(false)}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "12px",
                borderRadius: "12px",
                color: "#999",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      {showAddressBook && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowAddressBook(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AddressBook />
            <button
              onClick={() => setShowAddressBook(false)}
              style={{
                width: "100%",
                marginTop: "16px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "12px",
                borderRadius: "12px",
                color: "#999",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily:
                  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
