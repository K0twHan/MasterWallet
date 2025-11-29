import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import PriceChart from "./PriceChart";
import PortfolioChart from "./PortfolioChart";
import ActivePoolDetail from "./ActivePoolDetail";
import { EVMWalletService } from "../services/walletService";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface DashboardProps {
  walletAddress: string;
  walletAddresses: WalletAddresses;
  selectedChain: Chain;
  onChainChange: (chain: Chain) => void;
  seedPhrase: string;
  onBack: () => void;
  onNavigateToSwap: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToBridge: () => void;
  onNavigateToPools?: () => void;
  onNavigateToAIPools?: () => void;
  onNavigateToSend?: () => void;
}

export default function Dashboard({
  walletAddress,
  walletAddresses,
  selectedChain,
  onChainChange,
  seedPhrase,
  onBack,
  onNavigateToSwap,
  onNavigateToHistory,
  onNavigateToDashboard,
  onNavigateToBridge,
  onNavigateToPools,
  onNavigateToAIPools,
  onNavigateToSend,
}: DashboardProps) {
  const [selectedPool, setSelectedPool] = useState<{
    name: string;
    protocol: string;
    apy: string;
    staked: string;
    earnings: string;
    color: string;
  } | null>(null);

  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);

  // Fetch real balance from Sepolia testnet
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoadingBalance(true);

        // Use our EVMWalletService for Sepolia
        const evmService = new EVMWalletService(seedPhrase, "sepolia");

        // Get balance in wei
        const balanceWei = await evmService.getBalance();

        // Convert wei to ETH (1 ETH = 10^18 wei)
        const balanceEth = (Number(balanceWei) / 1e18).toFixed(6);

        setBalance(balanceEth);
        setIsLoadingBalance(false);

        // Clean up
        evmService.dispose();
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("0");
        setIsLoadingBalance(false);
      }
    };

    if (seedPhrase && selectedChain === "ethereum") {
      fetchBalance();
    }
  }, [seedPhrase, selectedChain, walletAddress]);

  const handleWithdraw = (amount: string) => {
    console.log("Withdrawn:", amount);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        padding: "0",
      }}
    >
      {/* Navbar */}
      <Navbar
        walletAddress={walletAddress}
        walletAddresses={walletAddresses}
        selectedChain={selectedChain}
        onChainChange={onChainChange}
        balance={isLoadingBalance ? "..." : balance}
        seedPhrase={seedPhrase}
        onLogout={onBack}
        onNavigateToSwap={onNavigateToSwap}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToBridge={onNavigateToBridge}
        onNavigateToPools={onNavigateToPools}
        onNavigateToAIPools={onNavigateToAIPools}
        onNavigateToSend={onNavigateToSend}
        currentPage="dashboard"
      />{" "}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "48px",
        }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "800",
              margin: "0 0 16px 0",
            }}
          >
            Master Wallet Dashboard
          </h1>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              fontSize: "14px",
              color: "#999",
            }}
          >
          </div>
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          {/* Price Chart Component */}
          <PriceChart />

          {/* Portfolio Performance Chart */}
          <PortfolioChart />
        </div>

        {/* Active Pools Card */}
        <div
          style={{
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "rgba(20, 20, 35, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  margin: 0,
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Active Pools
              </h2>
              <button
                onClick={() => onNavigateToPools?.()}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 107, 0, 0.3)",
                  color: "#FF6B00",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 0, 0.1)";
                  e.currentTarget.style.borderColor = "#FF6B00";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255, 107, 0, 0.3)";
                }}
              >
                View All
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                flex: 1,
              }}
            >
              {/* Mock Active Pools */}
              {[
                {
                  name: "ETH-USDC",
                  protocol: "Uniswap V3",
                  apy: "12.5%",
                  staked: "$1,250.00",
                  earnings: "+$45.20",
                  color: "#00E676",
                },
                {
                  name: "ETH-USDT",
                  protocol: "Curve",
                  apy: "18.3%",
                  staked: "$890.00",
                  earnings: "+$28.40",
                  color: "#FFA726",
                },
              ].map((pool, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPool(pool)}
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "16px",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = pool.color;
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          marginBottom: "4px",
                        }}
                      >
                        {pool.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#999",
                        }}
                      >
                        {pool.protocol}
                      </div>
                    </div>
                    <div
                      style={{
                        background: `${pool.color}20`,
                        color: pool.color,
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "700",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {pool.apy}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        Staked
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          fontFamily: "'SF Mono', monospace",
                        }}
                      >
                        {pool.staked}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        Earnings
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: pool.color,
                          fontFamily: "'SF Mono', monospace",
                        }}
                      >
                        {pool.earnings}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {false && (
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px dashed rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "40px 20px",
                    textAlign: "center",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "36px",
                      marginBottom: "12px",
                      opacity: 0.5,
                    }}
                  >
                    💧
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#666",
                      marginBottom: "16px",
                    }}
                  >
                    No active pools yet
                  </div>
                  <button
                    onClick={() => onNavigateToPools?.()}
                    style={{
                      background: "#FF6B00",
                      border: "none",
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#FF8533")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#FF6B00")
                    }
                  >
                    Explore Pools
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI-Managed Pools Section */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 82, 82, 0.05) 100%)",
            border: "1px solid rgba(255, 107, 0, 0.3)",
            borderRadius: "24px",
            padding: "40px",
            backdropFilter: "blur(10px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, rgba(255, 107, 0, 0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          ></div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🤖
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      margin: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                      background:
                        "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    AI-Managed Pools
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#FFB366",
                      fontSize: "14px",
                    }}
                  >
                    Automated investment strategies managed by artificial
                    intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToAIPools?.()}
                style={{
                  background:
                    "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
                  border: "none",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                Explore AI Strategies →
              </button>
            </div>

            {/* Warning Banner */}
            <div
              style={{
                background: "rgba(255, 82, 82, 0.15)",
                border: "1px solid rgba(255, 82, 82, 0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "20px" }}>⚠️</div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#FFB3B3",
                  lineHeight: "1.5",
                }}
              >
                <strong>High Risk Warning:</strong> AI strategies execute
                automatic trades and contain high volatility. Only invest
                amounts you can afford to lose.
              </div>
            </div>

            {/* Features Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  icon: "🎯",
                  title: "3 Different Strategies",
                  desc: "Aggressive, balanced and safe risk levels",
                },
                {
                  icon: "🔄",
                  title: "24/7 Automated Trading",
                  desc: "AI continuously analyzes the market and executes trades",
                },
                {
                  icon: "📊",
                  title: "High Return Potential",
                  desc: "Target APY ranges from 15% to 250% annually",
                },
                {
                  icon: "🛡️",
                  title: "Smart Risk Management",
                  desc: "Stop-loss and automatic rebalancing",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "20px",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(255, 107, 0, 0.1)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 107, 0, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.2)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                    {feature.icon}
                  </div>
                  <h4
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#FF6B00",
                    }}
                  >
                    {feature.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#999",
                      lineHeight: "1.5",
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Active Pool Detail Modal */}
      {selectedPool && (
        <ActivePoolDetail
          pool={selectedPool}
          onBack={() => setSelectedPool(null)}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  );
}
