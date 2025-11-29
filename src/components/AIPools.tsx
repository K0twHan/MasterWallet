import { useState } from "react";
import Navbar from "./Navbar";
import {
  Bot,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap,
  Activity,
  DollarSign,
  Target,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface AIPoolsProps {
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
  onNavigateToSend?: () => void;
  onNavigateToPools?: () => void;
  onNavigateToAIPools?: () => void;
}

interface AIStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: "aggressive" | "balanced" | "conservative";
  targetAPY: string;
  minDeposit: string;
  currentTVL: string;
  performance30d: string;
  winRate: string;
  activeTrades: number;
  features: string[];
}

export default function AIPools({
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
  onNavigateToSend,
  onNavigateToPools,
  onNavigateToAIPools,
}: AIPoolsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);

  const strategies: AIStrategy[] = [
    {
      id: "1",
      name: "AI Aggressive Trader",
      description:
        "High-frequency trading strategy. AI takes aggressive positions to maximize profit from market volatility.",
      riskLevel: "aggressive",
      targetAPY: "85-250%",
      minDeposit: "$1,000",
      currentTVL: "$5.2M",
      performance30d: "+47.3%",
      winRate: "68%",
      activeTrades: 47,
      features: [
        "High-frequency trading",
        "Leverage usage (3x-5x)",
        "Volatility arbitrage",
        "Stop-loss protection",
        "24/7 automated trading",
      ],
    },
    {
      id: "2",
      name: "AI Balanced Portfolio",
      description:
        "Balanced risk and return strategy. AI targets optimized returns with investments distributed across different pools.",
      riskLevel: "balanced",
      targetAPY: "35-85%",
      minDeposit: "$500",
      currentTVL: "$12.8M",
      performance30d: "+22.7%",
      winRate: "74%",
      activeTrades: 28,
      features: [
        "Diversified portfolio",
        "Medium risk, medium return",
        "Automatic rebalancing",
        "DeFi blue-chip focused",
        "Risk management algorithms",
      ],
    },
    {
      id: "3",
      name: "AI Conservative Growth",
      description:
        "Low-risk, stable returns strategy. AI invests in safe pools and stablecoins.",
      riskLevel: "conservative",
      targetAPY: "15-35%",
      minDeposit: "$250",
      currentTVL: "$24.6M",
      performance30d: "+8.4%",
      winRate: "82%",
      activeTrades: 15,
      features: [
        "Stablecoin weighted",
        "Low volatility",
        "Safe DeFi protocols",
        "Minimal impermanent loss",
        "Steady income focused",
      ],
    },
  ];

  const riskColors = {
    aggressive: {
      bg: "#FF5252",
      light: "rgba(255, 82, 82, 0.1)",
      border: "rgba(255, 82, 82, 0.3)",
    },
    balanced: {
      bg: "#FFA726",
      light: "rgba(255, 167, 38, 0.1)",
      border: "rgba(255, 167, 38, 0.3)",
    },
    conservative: {
      bg: "#00E676",
      light: "rgba(0, 230, 118, 0.1)",
      border: "rgba(0, 230, 118, 0.3)",
    },
  };

  const riskLabels = {
    aggressive: "High Risk",
    balanced: "Balanced Risk",
    conservative: "Low Risk",
  };

  const handleDeposit = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    setShowDepositModal(true);
  };

  const confirmDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const strategy = strategies.find((s) => s.id === selectedStrategy);
    if (!strategy) return;

    const minDeposit = parseFloat(strategy.minDeposit.replace(/[$,]/g, ""));
    const amount = parseFloat(depositAmount);

    if (amount < minDeposit) {
      alert(`Minimum deposit amount is ${strategy.minDeposit}`);
      return;
    }

    alert(
      `✅ Success!\n\n$${depositAmount} deposited to ${strategy.name}.\n\nAI will automatically invest in the best pools.`
    );
    setShowDepositModal(false);
    setDepositAmount("");
    setSelectedStrategy(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a1e 0%, #1a1a2e 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
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
        onNavigateToSend={onNavigateToSend}
        onNavigateToPools={onNavigateToPools}
        onNavigateToAIPools={onNavigateToAIPools}
        currentPage="ai-pools"
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Bot size={36} color="#FF6B00" />
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "700",
                margin: 0,
                background: "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              AI-Managed Pools
            </h1>
          </div>
          <p style={{ color: "#999", fontSize: "16px", margin: 0 }}>
            Automated trading strategies managed by artificial intelligence. AI
            invests in the best pools for you.
          </p>
        </div>

        {/* Critical Warning Banner */}
        <div
          style={{
            background: "rgba(255, 82, 82, 0.15)",
            border: "2px solid rgba(255, 82, 82, 0.4)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
          >
            <AlertTriangle
              size={32}
              color="#FF5252"
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <div>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#FF5252",
                }}
              >
                ⚠️ VERY HIGH RISK - WARNING
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#FFB3B3",
                  fontSize: "14px",
                  lineHeight: "1.8",
                }}
              >
                <li>
                  <strong>AI strategies carry high risk.</strong> You could lose
                  your entire investment.
                </li>
                <li>
                  <strong>
                    Past performance does not guarantee future returns.
                  </strong>{" "}
                  Market conditions can change.
                </li>
                <li>
                  <strong>AI decisions are automatic.</strong> You cannot
                  manually intervene, positions open and close instantly.
                </li>
                <li>
                  <strong>Only invest amounts you can afford to lose.</strong>{" "}
                  Do not use funds you may urgently need.
                </li>
                <li>
                  <strong>Smart contract risks exist.</strong> Technical issues
                  or hacks can affect your assets.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div
          style={{
            background: "rgba(255, 107, 0, 0.1)",
            border: "1px solid rgba(255, 107, 0, 0.3)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "32px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <Info
            size={24}
            color="#FF6B00"
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                fontWeight: "600",
                color: "#FF6B00",
              }}
            >
              How Does AI Pool Management Work?
            </h3>
            <p
              style={{
                margin: 0,
                color: "#FFB366",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Our AI algorithms analyze the market 24/7, identify the most
              profitable pools, and automatically invest. Positions are
              opened/closed based on market conditions with risk management. You
              just select a strategy and deposit, AI handles the rest.
            </p>
          </div>
        </div>

        {/* Live Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {[
            {
              label: "Total AI-Managed TVL",
              value: "$42.6M",
              icon: DollarSign,
              color: "#00E676",
            },
            {
              label: "Active Strategies",
              value: "3",
              icon: Brain,
              color: "#FF6B00",
            },
            {
              label: "Total Trades (24h)",
              value: "1,847",
              icon: Activity,
              color: "#FFA726",
            },
            {
              label: "Avg. Performance",
              value: "+26.1%",
              icon: TrendingUp,
              color: "#00E676",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  background: "rgba(20, 20, 40, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
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
                  <Icon size={18} color={stat.color} />
                  <span style={{ color: "#999", fontSize: "12px" }}>
                    {stat.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: stat.color,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Strategies Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "24px",
          }}
        >
          {strategies.map((strategy) => {
            const colors = riskColors[strategy.riskLevel];

            return (
              <div
                key={strategy.id}
                style={{
                  background: "rgba(20, 20, 40, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "28px",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = colors.bg;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${colors.light}`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Risk Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    background: colors.light,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: colors.bg,
                  }}
                >
                  {riskLabels[strategy.riskLevel]}
                </div>

                {/* Header */}
                <div style={{ marginBottom: "20px", paddingRight: "120px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <Bot size={24} color="#FF6B00" />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: "700",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {strategy.name}
                    </h3>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: "#999",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}
                  >
                    {strategy.description}
                  </p>
                </div>

                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "20px",
                    padding: "16px",
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        marginBottom: "4px",
                      }}
                    >
                      Target APY
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#00E676",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {strategy.targetAPY}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        marginBottom: "4px",
                      }}
                    >
                      30d Performance
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: strategy.performance30d.startsWith("+")
                          ? "#00E676"
                          : "#FF5252",
                        fontFamily: "'SF Mono', monospace",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {strategy.performance30d.startsWith("+") ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                      {strategy.performance30d}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        marginBottom: "4px",
                      }}
                    >
                      Win Rate
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {strategy.winRate}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        marginBottom: "4px",
                      }}
                    >
                      Active Trades
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#FFA726",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {strategy.activeTrades}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      color: "#999",
                      fontSize: "12px",
                      marginBottom: "10px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Features
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {strategy.features.map((feature, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          color: "#ccc",
                        }}
                      >
                        <Zap size={14} color="#FF6B00" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Info */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px 0",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        marginBottom: "4px",
                      }}
                    >
                      Min. Deposit
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {strategy.minDeposit}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        marginBottom: "4px",
                      }}
                    >
                      Current TVL
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {strategy.currentTVL}
                    </div>
                  </div>
                </div>

                {/* Deposit Button */}
                <button
                  onClick={() => handleDeposit(strategy.id)}
                  style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}CC 100%)`,
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${colors.light}`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Target size={18} />
                  Deposit & Activate AI
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && selectedStrategy && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "24px",
          }}
          onClick={() => setShowDepositModal(false)}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(20, 20, 35, 0.98) 0%, rgba(15, 15, 30, 0.98) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const strategy = strategies.find(
                (s) => s.id === selectedStrategy
              )!;
              const colors = riskColors[strategy.riskLevel];

              return (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <Bot size={32} color="#FF6B00" />
                    <div>
                      <h2
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "24px",
                          fontWeight: "700",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        Deposit to AI Strategy
                      </h2>
                      <div style={{ color: "#999", fontSize: "14px" }}>
                        {strategy.name}
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div
                    style={{
                      background: "rgba(255, 82, 82, 0.1)",
                      border: "1px solid rgba(255, 82, 82, 0.3)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                    >
                      <AlertTriangle
                        size={20}
                        color="#FF5252"
                        style={{ flexShrink: 0, marginTop: "2px" }}
                      />
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#FFB3B3",
                          lineHeight: "1.5",
                        }}
                      >
                        This strategy carries high risk. You could lose your
                        entire investment. Please only invest amounts you can
                        afford to lose.
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#999",
                        fontSize: "13px",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Deposit Amount (USD)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={`Min: ${strategy.minDeposit}`}
                      style={{
                        width: "100%",
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        padding: "16px",
                        color: "#fff",
                        fontSize: "18px",
                        fontFamily: "'SF Mono', monospace",
                        fontWeight: "600",
                        boxSizing: "border-box",
                      }}
                    />
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      Minimum deposit: {strategy.minDeposit}
                    </div>
                  </div>

                  {/* Strategy Info */}
                  <div
                    style={{
                      background: colors.light,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        fontSize: "13px",
                      }}
                    >
                      <div>
                        <div style={{ color: "#666", marginBottom: "4px" }}>
                          Risk Level
                        </div>
                        <div style={{ color: colors.bg, fontWeight: "600" }}>
                          {riskLabels[strategy.riskLevel]}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "#666", marginBottom: "4px" }}>
                          Target APY
                        </div>
                        <div style={{ color: "#00E676", fontWeight: "600" }}>
                          {strategy.targetAPY}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => setShowDepositModal(false)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        padding: "14px",
                        color: "#999",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeposit}
                      style={{
                        flex: 1,
                        background: colors.bg,
                        border: "none",
                        borderRadius: "12px",
                        padding: "14px",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Confirm Deposit
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
