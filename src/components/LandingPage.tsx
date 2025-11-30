import { useState } from "react";

// ----------------------------------------------------------------------
// 👇 LOGO IMPORT ALANI
// Buraya kendi logonuzu import edin. Örn: import WdkLogo from './assets/wdk-logo.png';
// ----------------------------------------------------------------------

interface LandingPageProps {
  onNavigateToWallet: () => void;
}

export default function LandingPage({ onNavigateToWallet }: LandingPageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505", // Tam siyah yerine çok koyu gri (göz yormaz)
        color: "#ffffff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* --- NAVBAR --- */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(5, 5, 5, 0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Logo Alanı */}
          <span
            style={{
              fontSize: "22px",
              fontWeight: "800",
              letterSpacing: "-0.5px",
            }}
          >
            Master<span style={{ color: "#FF6B00" }}>Wallet</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#agents" className="nav-link">
            AI Agents
          </a>
          <button onClick={onNavigateToWallet} style={styles.primaryBtnSmall}>
            Launch App
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 24px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Arka plan glow efekti */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(255,107,0,0.15) 0%, rgba(0,0,0,0) 70%)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        <div style={styles.badge}>Powered by Tether WDK & AI</div>

        <h1 style={styles.heroTitle}>
          Don't Let Your USDT <br />
          <span style={styles.gradientText}>Sleep in Your Wallet.</span>
        </h1>

        <p style={styles.heroSubtitle}>
          The smartest way to earn yield. <br />
          <b>Simple</b> for everyone. <b>Autonomous AI Agents</b> for pros.
          <br />
          <span style={{ color: "#FF6B00", fontWeight: 600 }}>
            Swap, Bridge, and use our Voice Chatbot for easy DeFi.
          </span>
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            marginTop: "48px",
          }}
        >
          <button onClick={onNavigateToWallet} style={styles.primaryBtnLarge}>
            Launch App
          </button>
          <button style={styles.secondaryBtnLarge}>Explore Strategies</button>
        </div>

        {/* Supported Chains section removed as requested */}
      </section>

      {/* --- FEATURES GRID --- */}
      <section
        id="features"
        style={{ background: "#0a0a0a", padding: "100px 24px" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2
              style={{
                fontSize: "42px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              One Wallet. Two Worlds.
            </h2>
            <p style={{ fontSize: "18px", color: "#888" }}>
              Designed to onboard beginners and empower experts.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "32px",
            }}
          >
            {/* Kart 1: Beginners */}
            <FeatureCard
              icon="🌱"
              title="Easy Onboarding"
              highlight="For Everyone"
              desc="No complex DeFi jargon. Just deposit USDT and click 'Earn'. We scan the safest pools (Aave, Curve) and handle the rest."
            />

            {/* Kart 2: Swap & Bridge */}
            <FeatureCard
              icon="🔄"
              title="Swap & Bridge"
              highlight="Multi-Chain"
              desc="Swap tokens instantly and bridge assets between chains with a single click. Powered by Tether WDK for fast, low-fee transactions."
            />

            {/* Kart 3: Voice Chatbot */}
            <FeatureCard
              icon="🎤"
              title="Voice Chatbot"
              highlight="AI Assistant"
              desc="Ask questions, get pool suggestions, and manage your wallet using voice commands. Your personal DeFi assistant is always online."
            />

            {/* Kart 4: AI Agents */}
            <FeatureCard
              icon="🤖"
              title="AI Agent Automation"
              highlight="For Pros"
              desc="Set your risk tolerance and let our AI Agents hunt for the best APY across chains. Auto-rebalance, auto-compound, 24/7."
            />

            {/* Kart 5: Security */}
            <FeatureCard
              icon="🛡️"
              title="Non-Custodial Security"
              highlight="Bank Grade"
              desc="Your keys, your crypto. Powered by Tether WDK, ensuring that even we cannot access your funds. You are the only owner."
            />
          </div>
        </div>
      </section>

      {/* --- AGENT SECTION (PRO MODE) --- */}
      <section
        id="agents"
        style={{ padding: "100px 24px", borderTop: "1px solid #222" }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "60px",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h2
              style={{
                fontSize: "40px",
                fontWeight: "700",
                marginBottom: "24px",
                lineHeight: "1.2",
              }}
            >
              Let AI Do the Heavy Lifting.
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#999",
                lineHeight: "1.6",
                marginBottom: "32px",
              }}
            >
              Professional DeFi trading requires monitoring pools 24/7. Our AI
              Agents do that for you.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <ListItem text="Scans 1000+ pools across 5 chains instantly" />
              <ListItem text="Detects risk & volatility in real-time" />
              <ListItem text="Auto-executes swaps when gas fees are low" />
            </ul>
          </div>

          <div style={{ flex: 1, minWidth: "300px" }}>
            {/* Yapay arayüz görseli */}
            <div
              style={{
                background: "linear-gradient(145deg, #1a1a1a, #111)",
                borderRadius: "24px",
                padding: "32px",
                border: "1px solid #333",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#fff" }}>
                  🤖 Agent Active
                </span>
                <span style={{ color: "#28a745" }}>● Running</span>
              </div>
              <div
                style={{
                  background: "#000",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "12px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#0f0",
                }}
              >
                {">"} Scanning Uniswap V3 Pools... <br />
                {">"} Opportunity Found: USDT/ETH (APY 12.4%) <br />
                {">"} Risk Analysis: LOW <br />
                {">"} Preparing Transaction... <br />
                {">"} Waiting for user PIN...
              </div>
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#333",
                  border: "none",
                  color: "#fff",
                  cursor: "default",
                }}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer
        style={{
          borderTop: "1px solid #222",
          padding: "60px 24px",
          textAlign: "center",
          background: "#050505",
          color: "#666",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {" "}
          <span
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#FF6B00",
              letterSpacing: "0.5px",
            }}
          >
            Powered by Tether WDK
          </span>
        </div>
        <p style={{ fontSize: "14px", marginTop: "18px" }}>
          Built for the <b>Tether WDK Hackathon</b>. Empowering financial
          freedom.
        </p>
      </footer>

      {/* CSS Styles for Hover Effects */}
      <style>{`
        .nav-link {
            color: #ccc;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        .nav-link:hover {
            color: #FF6B00;
        }
      `}</style>
    </div>
  );
}

// --- ALT BİLEŞENLER (Components) ---

// 1. Özellik Kartı (Hover Efektli)
function FeatureCard({
  icon,
  title,
  desc,
  highlight,
}: {
  icon: string;
  title: string;
  desc: string;
  highlight?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
        border: hover ? "1px solid #FF6B00" : "1px solid #222",
        borderRadius: "20px",
        padding: "40px 32px",
        transition: "all 0.3s ease",
        transform: hover ? "scale(1.02) translateY(-5px)" : "scale(1)",
        cursor: "default",
        boxShadow: hover ? "0 10px 30px rgba(255, 107, 0, 0.1)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255, 107, 0, 0.1)",
            color: "#FF6B00",
            fontSize: "11px",
            fontWeight: "bold",
            padding: "4px 10px",
            borderRadius: "100px",
            textTransform: "uppercase",
          }}
        >
          {highlight}
        </div>
      )}
      <div style={{ fontSize: "48px", marginBottom: "24px" }}>{icon}</div>
      <h3
        style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "16px",
          color: hover ? "#fff" : "#eee",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "16px", color: "#888", lineHeight: "1.6" }}>
        {desc}
      </p>
    </div>
  );
}

// 2. Liste Elemanı
function ListItem({ text }: { text: string }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "16px",
        color: "#ccc",
      }}
    >
      <span style={{ color: "#FF6B00", fontSize: "18px" }}>✓</span>
      {text}
    </li>
  );
}

// --- STYLES ---
const styles = {
  badge: {
    display: "inline-block",
    padding: "6px 16px",
    background: "rgba(255, 107, 0, 0.1)",
    border: "1px solid rgba(255, 107, 0, 0.3)",
    borderRadius: "100px",
    marginBottom: "32px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#FF6B00",
    letterSpacing: "0.5px",
  },
  heroTitle: {
    fontSize: "64px",
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: "24px",
    letterSpacing: "-1.5px",
  },
  gradientText: {
    background: "linear-gradient(90deg, #FF6B00 0%, #FF9F43 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "20px",
    color: "#888",
    lineHeight: "1.6",
    maxWidth: "600px",
    margin: "0 auto",
  },
  primaryBtnSmall: {
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  primaryBtnLarge: {
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    padding: "18px 48px",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s",
    boxShadow: "0 8px 24px rgba(255, 107, 0, 0.3)",
  },
  secondaryBtnLarge: {
    background: "transparent",
    color: "#fff",
    border: "1px solid #333",
    padding: "18px 48px",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "border 0.2s",
  },
};
