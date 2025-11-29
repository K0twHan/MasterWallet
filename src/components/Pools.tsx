import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  Zap,
  Info,
  ChevronRight,
} from "lucide-react";
import React from "react";

type Chain = "ethereum" | "bitcoin" | "solana";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface PoolsProps {
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
  onNavigateToPoolDetail: (poolId: string) => void;
}

type RiskLevel = "safe" | "moderate" | "risky";

interface Pool {
  id: string;
  name: string;
  protocol: string;
  apy: string;
  tvl: string;
  risk: RiskLevel;
  tokens: string[];
  description: string;
  network: string;
}

const riskConfig = {
  safe: {
    label: "Safe",
    color: "#00E676",
    icon: Shield,
    bgColor: "rgba(0, 230, 118, 0.1)",
    borderColor: "rgba(0, 230, 118, 0.3)",
  },
  moderate: {
    label: "Moderate Risk",
    color: "#FFA726",
    icon: TrendingUp,
    bgColor: "rgba(255, 167, 38, 0.1)",
    borderColor: "rgba(255, 167, 38, 0.3)",
  },
  risky: {
    label: "High Risk",
    color: "#FF5252",
    icon: AlertTriangle,
    bgColor: "rgba(255, 82, 82, 0.1)",
    borderColor: "rgba(255, 82, 82, 0.3)",
  },
};

export default function Pools({
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
  onNavigateToPoolDetail,
}: PoolsProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | "all">("all");
  const [sortBy, setSortBy] = useState<"apy" | "tvl">("apy");
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch pools from API
  React.useEffect(() => {
    setLoading(true);
    fetch("http://10.0.77.251:8000/gecko/pool/usdt")
      .then((res) => res.json())
      .then((data) => {
        setPools(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch pools");
        setLoading(false);
      });
  }, []);

  // Map API badge color to risk type
  function badgeColorToRisk(color: string): RiskLevel {
    if (color === "green") return "safe";
    if (color === "orange") return "moderate";
    if (color === "red") return "risky";
    return "risky";
  }

  // Transform API pools to UI pools
  const uiPools = pools.map((pool) => ({
    id: pool.id,
    name: pool.title,
    protocol: pool.sub_title.split(" • ")[0],
    apy: pool.metrics.apy.value.replace("%", "") + "%",
    tvl: pool.metrics.tvl.value,
    risk: badgeColorToRisk(pool.badge.color),
    tokens: pool.tags,
    description: pool.description,
    network: pool.sub_title.split(" • ")[1] || "",
    badge: pool.badge,
    volume: pool.metrics.volume?.value,
  }));

  const filteredPools = uiPools.filter((pool) => {
    if (selectedRisk === "all") return true;
    return pool.risk === selectedRisk;
  });

  const sortedPools = [...filteredPools].sort((a, b) => {
    if (sortBy === "apy") {
      return parseFloat(b.apy) - parseFloat(a.apy);
    } else {
      // Remove $ and K/M for sorting
      const parseTvl = (tvl: string) => {
        let num = parseFloat(tvl.replace(/[$,KM]/g, ""));
        if (tvl.includes("M")) num *= 1000000;
        if (tvl.includes("K")) num *= 1000;
        return num;
      };
      return parseTvl(b.tvl) - parseTvl(a.tvl);
    }
  });

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
        onNavigateToPools={onNavigateToPools}
        onNavigateToAIPools={onNavigateToAIPools}
        onNavigateToSend={onNavigateToSend}
        currentPage="pools"
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              margin: "0 0 12px 0",
              background: "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily:
                "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            Liquidity Pools
          </h1>
          <p style={{ color: "#999", fontSize: "16px", margin: 0 }}>
            Earn passive income by providing liquidity. Choose pools based on
            your risk level.
          </p>
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
              How Does Liquidity Mining Work?
            </h3>
            <p
              style={{
                margin: 0,
                color: "#FFB366",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              By providing liquidity to token pairs, you earn a share of trading
              fees and rewards. High APY usually means higher risk. Consider
              impermanent loss risk.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Risk Filter */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedRisk("all")}
              style={{
                background:
                  selectedRisk === "all"
                    ? "rgba(255, 107, 0, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  selectedRisk === "all"
                    ? "1px solid #FF6B00"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "10px 20px",
                color: selectedRisk === "all" ? "#FF6B00" : "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              All
            </button>
            {(Object.keys(riskConfig) as RiskLevel[]).map((risk) => {
              const config = riskConfig[risk];
              const Icon = config.icon;
              return (
                <button
                  key={risk}
                  onClick={() => setSelectedRisk(risk)}
                  style={{
                    background:
                      selectedRisk === risk
                        ? config.bgColor
                        : "rgba(255, 255, 255, 0.05)",
                    border:
                      selectedRisk === risk
                        ? `1px solid ${config.color}`
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    color: selectedRisk === risk ? config.color : "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Icon size={16} />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: "#999", fontSize: "14px" }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "apy" | "tvl")}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <option value="apy">APY (High → Low)</option>
              <option value="tvl">TVL (High → Low)</option>
            </select>
          </div>
        </div>

        {/* Pools Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "24px",
          }}
        >
          {sortedPools.map((pool) => {
            const riskData = riskConfig[pool.risk];
            const RiskIcon = riskData.icon;

            return (
              <div
                key={pool.id}
                onClick={() => onNavigateToPoolDetail(pool.id)}
                style={{
                  background: "rgba(20, 20, 40, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = riskData.color;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${riskData.color}40`;
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
                    top: "16px",
                    right: "16px",
                    background: riskData.bgColor,
                    border: `1px solid ${riskData.borderColor}`,
                    borderRadius: "8px",
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: riskData.color,
                  }}
                >
                  <RiskIcon size={14} />
                  {riskData.label}
                </div>

                {/* Pool Header */}
                <div style={{ marginBottom: "16px", paddingRight: "100px" }}>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "20px",
                      fontWeight: "700",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {pool.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#999",
                      fontSize: "13px",
                    }}
                  >
                    <span>{pool.protocol}</span>
                    <span>•</span>
                    <span>{pool.network}</span>
                  </div>
                </div>

                {/* Tokens */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {pool.tokens
                    .filter(
                      (token: any) =>
                        typeof token === "string" ||
                        typeof token === "number"
                    )
                    .map((token: string | number) => (
                      <div
                        key={token}
                        style={{
                          background: "rgba(255, 107, 0, 0.1)",
                          border: "1px solid rgba(255, 107, 0, 0.3)",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#FF6B00",
                        }}
                      >
                        {token}
                      </div>
                    ))}
                </div>

                {/* Description */}
                <p
                  style={{
                    color: "#999",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    marginBottom: "20px",
                  }}
                >
                  {pool.description}
                </p>

                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#999",
                        fontSize: "12px",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      APY
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#00E676",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {pool.apy}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#999",
                        fontSize: "12px",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      TVL
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {pool.tvl}
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    right: "24px",
                    width: "32px",
                    height: "32px",
                    background: riskData.bgColor,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight size={18} color={riskData.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedPools.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#666",
            }}
          >
            <Zap size={64} color="#333" style={{ marginBottom: "20px" }} />
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              No pools found at selected risk level
            </h3>
            <p style={{ fontSize: "14px" }}>
              Try selecting a different risk level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
