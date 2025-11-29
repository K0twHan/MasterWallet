import { useState } from "react";
import WDK from "@tetherto/wdk";
import * as EvmModule from "@tetherto/wdk-wallet-evm";
import WalletManagerSolana from "@tetherto/wdk-wallet-solana";
import {
  Wallet,
  CheckCircle,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { signInWithGoogle } from "../services/firebaseAuth";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface CreateWalletProps {
  onBack: () => void;
  onWalletCreated: (addresses: WalletAddresses, seedPhrase: string) => void;
}

export default function CreateWallet({
  onBack,
  onWalletCreated,
}: CreateWalletProps) {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [addresses, setAddresses] = useState<WalletAddresses>({
    ethereum: "",
    bitcoin: "",
    solana: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showSeedWarning, setShowSeedWarning] = useState(false);
  const [seedRevealed, setSeedRevealed] = useState(false);
  const [hasConfirmedWarning, setHasConfirmedWarning] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string } | null>(null);

  const createWallet = async () => {
    setIsCreating(true);
    try {
      const seed = WDK.getRandomSeedPhrase();
      setMnemonic(seed);

      const wdk = new WDK(seed);

      // Register Ethereum wallet
      const EvmClass =
        (EvmModule as any).default ||
        (EvmModule as any).WalletManagerEvm ||
        EvmModule;
      wdk.registerWallet("ethereum", EvmClass, {
        provider: "https://eth.drpc.org",
      });

      const wdkAny = wdk as any;
      const newAddresses: WalletAddresses = {
        ethereum: "",
        bitcoin: "",
        solana: "",
      };

      // Get Ethereum address
      const ethWallet = wdkAny._wallets?.get("ethereum");
      if (ethWallet && ethWallet.getAccount) {
        const ethAcc = await ethWallet.getAccount();
        newAddresses.ethereum = ethAcc?.__address || ethAcc?.address || "";
      }

      // Bitcoin - Generate placeholder address (Browser environment limitation)
      // BTC wallet requires Node.js net.Socket which is not available in browser
      // Using deterministic placeholder based on seed phrase
      const btcHash = seed.split(" ").reduce((hash, word) => {
        return hash + word.charCodeAt(0);
      }, 0);
      newAddresses.bitcoin = `bc1q${btcHash.toString(36)}${seed.split(" ")[0]}${
        seed.split(" ")[1]
      }`
        .toLowerCase()
        .slice(0, 42);

      // Solana - Create real wallet using WDK Solana module
      try {
        const solanaWallet = new WalletManagerSolana(seed, {
          rpcUrl: "https://api.devnet.solana.com",
          commitment: "confirmed",
        });
        const solanaAccount = await solanaWallet.getAccount(0);
        newAddresses.solana = await solanaAccount.getAddress();
        solanaWallet.dispose();
        console.log("✅ Solana wallet created:", newAddresses.solana);
      } catch (solanaError) {
        console.error("Solana wallet creation error:", solanaError);
        // Fallback to placeholder if Solana module fails
        newAddresses.solana = "SOL_WALLET_ERROR";
      }

      setAddresses(newAddresses);
      setShowSeedWarning(true);
    } catch (error) {
      console.error("Wallet creation error:", error);
      alert("Failed to create wallet. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const createWalletWithGoogle = async () => {
    setIsCreating(true);
    try {
      // Sign in with Google
      const user = await signInWithGoogle();
      
      if (!user || !user.email) {
        throw new Error('Failed to get user information from Google');
      }

      // Store seed with Google user ID for future retrieval
      // NOTE: In production, encrypt and store on secure backend!
      const storageKey = `wdk-wallet-${user.uid}`;
      let userSeed = localStorage.getItem(storageKey);
      
      const isExistingUser = !!userSeed;
      
      if (!userSeed) {
        // First time user - create new wallet
        userSeed = WDK.getRandomSeedPhrase();
        localStorage.setItem(storageKey, userSeed);
        console.log('🆕 New wallet created for Google user');
      } else {
        console.log('🔄 Existing wallet loaded for Google user');
      }
      
      setMnemonic(userSeed);
      
      const wdk = new WDK(userSeed);

      // Register Ethereum wallet
      const EvmClass =
        (EvmModule as any).default ||
        (EvmModule as any).WalletManagerEvm ||
        EvmModule;
      wdk.registerWallet("ethereum", EvmClass, {
        provider: "https://eth.drpc.org",
      });

      const wdkAny = wdk as any;
      const newAddresses: WalletAddresses = {
        ethereum: "",
        bitcoin: "",
        solana: "",
      };

      // Get Ethereum address
      const ethWallet = wdkAny._wallets?.get("ethereum");
      if (ethWallet && ethWallet.getAccount) {
        const ethAcc = await ethWallet.getAccount();
        newAddresses.ethereum = ethAcc?.__address || ethAcc?.address || "";
      }

      // Bitcoin - Generate placeholder
      const btcHash = userSeed.split(" ").reduce((hash, word) => {
        return hash + word.charCodeAt(0);
      }, 0);
      newAddresses.bitcoin = `bc1q${btcHash.toString(36)}${userSeed.split(" ")[0]}${
        userSeed.split(" ")[1]
      }`
        .toLowerCase()
        .slice(0, 42);

      // Solana wallet
      try {
        const solanaWallet = new WalletManagerSolana(userSeed, {
          rpcUrl: "https://api.devnet.solana.com",
          commitment: "confirmed",
        });
        const solanaAccount = await solanaWallet.getAccount(0);
        newAddresses.solana = await solanaAccount.getAddress();
        solanaWallet.dispose();
      } catch (solanaError) {
        console.error("Solana wallet creation error:", solanaError);
        newAddresses.solana = "SOL_WALLET_ERROR";
      }

      setAddresses(newAddresses);
      
      // If existing user, directly go to dashboard
      if (isExistingUser) {
        console.log('✅ Existing user redirected to dashboard:', user.email);
        onWalletCreated(newAddresses, userSeed);
        return;
      }
      
      // New user - show seed phrase warning
      setGoogleUser({
        email: user.email,
        name: user.displayName || 'User'
      });
      setShowSeedWarning(true);
      
      console.log('✅ New wallet created with Google account:', user.email);
    } catch (error: any) {
      console.error("Google wallet creation error:", error);
      alert(error.message || "Failed to create wallet with Google. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Generate deterministic seed from Google user ID

  const handleRevealSeed = () => {
    if (!hasConfirmedWarning) {
      setHasConfirmedWarning(true);
    } else {
      setSeedRevealed(true);
    }
  };

  const handleFinish = () => {
    onWalletCreated(addresses, mnemonic);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <button
        onClick={onBack}
        style={{
          position: "fixed",
          top: "32px",
          left: "32px",
          background: "transparent",
          border: "1px solid #333",
          color: "#999",
          padding: "12px 24px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "#FF6B00";
          e.currentTarget.style.color = "#FF6B00";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "#333";
          e.currentTarget.style.color = "#999";
        }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "#111",
          border: "1px solid #222",
          borderRadius: "24px",
          padding: "48px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {!addresses.ethereum ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
                  margin: "0 auto 24px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(255, 107, 0, 0.4)",
                }}
              >
                <Wallet size={40} color="#fff" />
              </div>
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: "0 0 16px 0",
                }}
              >
                Create Your Wallet
              </h1>
              <p style={{ color: "#999", fontSize: "16px", lineHeight: "1.6" }}>
                Generate a secure, self-custodial multi-chain wallet powered by
                Tether WDK
              </p>
            </div>

            <button
              onClick={createWallet}
              disabled={isCreating}
              style={{
                width: "100%",
                background: isCreating ? "#333" : "#FF6B00",
                color: "#fff",
                border: "none",
                padding: "20px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "700",
                cursor: isCreating ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                marginBottom: "16px",
                boxShadow: isCreating
                  ? "none"
                  : "0 8px 24px rgba(255, 107, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
              onMouseOver={(e) => {
                if (!isCreating)
                  e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                if (!isCreating)
                  e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {isCreating ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #fff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Creating Wallet...
                </>
              ) : (
                <>
                  <Wallet size={20} />
                  Generate New Wallet
                </>
              )}
            </button>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              margin: '24px 0'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
              <span style={{ color: '#666', fontSize: '14px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
            </div>

            <button
              onClick={createWalletWithGoogle}
              disabled={isCreating}
              style={{
                width: "100%",
                background: isCreating ? "#333" : "#fff",
                color: isCreating ? "#666" : "#000",
                border: "none",
                padding: "20px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "700",
                cursor: isCreating ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                marginBottom: "24px",
                boxShadow: isCreating
                  ? "none"
                  : "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
              onMouseOver={(e) => {
                if (!isCreating) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";
                }
              }}
              onMouseOut={(e) => {
                if (!isCreating) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                }
              }}
            >
              {isCreating ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #666",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Creating with Google...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div
              style={{
                background: "rgba(255, 107, 0, 0.1)",
                border: "1px solid rgba(255, 107, 0, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                color: "#FF6B00",
                fontSize: "14px",
                lineHeight: "1.6",
                display: "flex",
                gap: "12px",
              }}
            >
              <AlertTriangle
                size={20}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <div>
                <strong>Important:</strong> Your wallet will be generated
                locally. Save your seed phrase securely - it's the only way to
                recover your wallet.
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
                  margin: "0 auto 24px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={40} color="#fff" strokeWidth={2.5} />
              </div>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: "0 0 8px 0",
                  fontFamily:
                    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Wallet Created!
              </h2>
              <p style={{ color: "#999", fontSize: "14px" }}>
                {googleUser ? (
                  <>
                    Welcome, <strong style={{ color: '#00E676' }}>{googleUser.name}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#666' }}>{googleUser.email}</span>
                  </>
                ) : (
                  'Your secure multi-chain wallet is ready'
                )}
              </p>
            </div>

            {/* Multi-Chain Addresses Display */}
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Ethereum */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#999",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>⟠</span> Ethereum Address
                </label>
                <div
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #627EEA",
                    borderRadius: "12px",
                    padding: "16px",
                    wordBreak: "break-all",
                    fontFamily:
                      "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                    fontSize: "13px",
                    color: "#627EEA",
                    fontWeight: "500",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {addresses.ethereum}
                </div>
              </div>

              {/* Bitcoin */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#999",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>₿</span> Bitcoin Address{" "}
                  <span style={{ fontSize: "10px", color: "#666" }}>
                    (Placeholder - Browser Limitation)
                  </span>
                </label>
                <div
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #F7931A",
                    borderRadius: "12px",
                    padding: "16px",
                    wordBreak: "break-all",
                    fontFamily:
                      "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                    fontSize: "13px",
                    color: "#F7931A",
                    fontWeight: "500",
                    letterSpacing: "-0.02em",
                    opacity: 0.5,
                  }}
                >
                  {addresses.bitcoin}
                </div>
              </div>

              {/* Solana */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#999",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>◎</span> Solana Address{" "}
                  <span style={{ fontSize: "10px", color: "#666" }}>
                    (Coming Soon)
                  </span>
                </label>
                <div
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #14F195",
                    borderRadius: "12px",
                    padding: "16px",
                    wordBreak: "break-all",
                    fontFamily:
                      "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                    fontSize: "13px",
                    color: "#14F195",
                    fontWeight: "500",
                    letterSpacing: "-0.02em",
                    opacity: 0.5,
                  }}
                >
                  {addresses.solana}
                </div>
              </div>
            </div>

            {showSeedWarning && !seedRevealed && (
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#999",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Recovery Phrase (Keep Secret!)
                </label>

                <div
                  style={{
                    background: "#0a0a0a",
                    border: "2px solid #FF6B00",
                    borderRadius: "12px",
                    padding: "32px 20px",
                    textAlign: "center",
                    position: "relative",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Key size={48} color="#FF6B00" />
                  </div>
                  <div
                    style={{
                      fontFamily:
                        "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                      fontSize: "14px",
                      color: "#666",
                      filter: "blur(8px)",
                      userSelect: "none",
                      marginBottom: "20px",
                      fontWeight: "500",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {mnemonic}
                  </div>

                  {!hasConfirmedWarning ? (
                    <div
                      style={{
                        background: "rgba(255, 107, 0, 0.15)",
                        border: "1px solid rgba(255, 107, 0, 0.3)",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#FF6B00",
                        lineHeight: "1.6",
                        textAlign: "left",
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
                        <AlertTriangle size={16} />
                        <strong>CRITICAL SECURITY WARNING</strong>
                      </div>
                      • Never share your recovery phrase with anyone
                      <br />
                      • Store it offline in a secure location
                      <br />
                      • Anyone with this phrase can access your funds
                      <br />• We cannot recover it if you lose it
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "rgba(255, 165, 0, 0.15)",
                        border: "1px solid rgba(255, 165, 0, 0.3)",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#FFA500",
                        lineHeight: "1.6",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <CheckCircle size={16} />
                        <strong>Warning Acknowledged</strong>
                      </div>
                      Click "Reveal Seed Phrase" again to view your recovery
                      words.
                    </div>
                  )}

                  <button
                    onClick={handleRevealSeed}
                    style={{
                      background: hasConfirmedWarning
                        ? "#FF6B00"
                        : "transparent",
                      color: hasConfirmedWarning ? "#fff" : "#FF6B00",
                      border: hasConfirmedWarning
                        ? "none"
                        : "2px solid #FF6B00",
                      padding: "12px 32px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      margin: "0 auto",
                    }}
                    onMouseOver={(e) => {
                      if (hasConfirmedWarning) {
                        e.currentTarget.style.background = "#FF8533";
                      } else {
                        e.currentTarget.style.background =
                          "rgba(255, 107, 0, 0.1)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (hasConfirmedWarning) {
                        e.currentTarget.style.background = "#FF6B00";
                      } else {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {hasConfirmedWarning ? (
                      <>
                        <Eye size={16} />
                        Reveal Seed Phrase
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} />I Understand the Risks
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {seedRevealed && (
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#999",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Recovery Phrase (Keep Secret!)
                </label>
                <div
                  style={{
                    background: "#0a0a0a",
                    border: "2px solid #FF6B00",
                    borderRadius: "12px",
                    padding: "20px",
                    fontFamily:
                      "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                    fontSize: "14px",
                    color: "#FF6B00",
                    lineHeight: "1.8",
                    position: "relative",
                    fontWeight: "500",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {mnemonic}
                  <button
                    onClick={() => setSeedRevealed(false)}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "transparent",
                      border: "1px solid #FF6B00",
                      color: "#FF6B00",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      marginTop: "36px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <EyeOff size={14} />
                    Hide
                  </button>
                </div>
              </div>
            )}

            <div
              style={{
                background: "rgba(0, 200, 83, 0.1)",
                border: "1px solid rgba(0, 200, 83, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                fontSize: "13px",
                color: "#00C853",
                lineHeight: "1.6",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Wallet successfully created!</strong> Make sure to save
                your recovery phrase before proceeding.
              </span>
            </div>

            <button
              onClick={handleFinish}
              style={{
                width: "100%",
                background: "#00C853",
                color: "#fff",
                border: "none",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#00E676")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#00C853")}
            >
              <CheckCircle size={18} />
              Done - Go to Homepage
            </button>

            <button
              onClick={() => {
                setAddresses({ ethereum: "", bitcoin: "", solana: "" });
                setMnemonic("");
                setSeedRevealed(false);
                setHasConfirmedWarning(false);
                setShowSeedWarning(false);
              }}
              style={{
                width: "100%",
                background: "transparent",
                color: "#999",
                border: "1px solid #333",
                padding: "12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#666")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#333")}
            >
              Create Another Wallet
            </button>
          </>
        )}
      </div>

      <p
        style={{
          marginTop: "32px",
          color: "#666",
          fontSize: "14px",
        }}
      >
        Powered by{" "}
        <span style={{ color: "#FF6B00", fontWeight: "600" }}>Tether WDK</span>
      </p>
    </div>
  );
}
