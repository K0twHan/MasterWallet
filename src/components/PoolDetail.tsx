import { useState } from 'react';
import Navbar from './Navbar';
import { ArrowLeft, TrendingUp, Shield, AlertTriangle, Info, ExternalLink, Plus, Minus } from 'lucide-react';

type Chain = 'ethereum' | 'bitcoin' | 'solana';

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface PoolDetailProps {
  poolId: string;
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
  onNavigateToPoolsList: () => void;
}

type RiskLevel = 'safe' | 'moderate' | 'risky';

interface PoolData {
  id: string;
  name: string;
  protocol: string;
  apy: string;
  tvl: string;
  risk: RiskLevel;
  tokens: string[];
  description: string;
  network: string;
  volume24h: string;
  fees24h: string;
  myStake: string;
  myEarnings: string;
  contract: string;
}

const riskConfig = {
  safe: {
    label: 'Safe',
    color: '#00E676',
    icon: Shield,
    bgColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: 'rgba(0, 230, 118, 0.3)'
  },
  moderate: {
    label: 'Moderate Risk',
    color: '#FFA726',
    icon: TrendingUp,
    bgColor: 'rgba(255, 167, 38, 0.1)',
    borderColor: 'rgba(255, 167, 38, 0.3)'
  },
  risky: {
    label: 'High Risk',
    color: '#FF5252',
    icon: AlertTriangle,
    bgColor: 'rgba(255, 82, 82, 0.1)',
    borderColor: 'rgba(255, 82, 82, 0.3)'
  }
};

export default function PoolDetail({
  poolId,
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
  onNavigateToPoolsList
}: PoolDetailProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdPools, setCreatedPools] = useState<Array<{ token1: string; token2: string; amount1: string; amount2: string; fee: number; platformFee: number }>>([]);
  const [pendingDeposit, setPendingDeposit] = useState<null | { token1: string; token2: string; amount1: string; amount2: string; fee: number; platformFee: number }>(null);

  // Mock pool data - in real app, fetch based on poolId
  const poolsData: Record<string, PoolData> = {
    '1': {
      id: '1',
      name: 'USDC-USDT Stable Pool',
      protocol: 'Uniswap V3',
      apy: '5.2%',
      tvl: '$125M',
      risk: 'safe',
      tokens: ['WETH', 'USDT'],
      description: 'Low-risk stablecoin pool. Minimal impermanent loss risk.',
      network: 'Ethereum',
      volume24h: '$8.5M',
      fees24h: '$12,450',
      myStake: '0',
      myEarnings: '0',
      contract: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD'
    },
    '2': {
      id: '2',
      name: 'ETH-USDC Pool',
      protocol: 'Curve Finance',
      apy: '12.5%',
      tvl: '$89M',
      risk: 'safe',
      tokens: ['ETH', 'USDC'],
      description: 'Safe returns with blue-chip assets.',
      network: 'Ethereum',
      volume24h: '$6.2M',
      fees24h: '$9,850',
      myStake: '0',
      myEarnings: '0',
      contract: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
    }
  };

  const pool = poolsData[poolId] || poolsData['1'];
  const riskData = riskConfig[pool.risk];
  const RiskIcon = riskData.icon;

  const handleDeposit = () => {
    if (!token1Amount || !token2Amount) {
      alert('Please enter amount for both tokens');
      return;
    }
    // Example fee calculation (replace with real logic if needed)
    const fee = (parseFloat(token1Amount) + parseFloat(token2Amount)) * 0.003; // 0.3% fee
    const platformFee = (parseFloat(token1Amount) + parseFloat(token2Amount)) * 0.001; // 0.1% platform fee
    setPendingDeposit({
      token1: pool.tokens[0],
      token2: pool.tokens[1],
      amount1: token1Amount,
      amount2: token2Amount,
      fee,
      platformFee,
    });
    setShowConfirmModal(true);
  };

  const confirmDeposit = () => {
    if (pendingDeposit) {
      setCreatedPools([...createdPools, pendingDeposit]);
      setShowConfirmModal(false);
      setToken1Amount('');
      setToken2Amount('');
      alert(`Deposit successful!\n${pendingDeposit.amount1} ${pendingDeposit.token1} + ${pendingDeposit.amount2} ${pendingDeposit.token2}`);
      setPendingDeposit(null);
    }
  };

  const handleWithdraw = (index: number, withdrawAmount: string) => {
    if (!withdrawAmount) {
      alert('Please enter withdrawal amount');
      return;
    }
    alert(`Withdrawal successful!\n${withdrawAmount} LP Token withdrawn`);
    // Remove pool from active pools after withdrawal
    setCreatedPools(createdPools.filter((_, i) => i !== index));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1e 0%, #1a1a2e 100%)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif"
    }}>
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

      {/* Confirmation Modal */}
      {showConfirmModal && pendingDeposit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '32px',
            minWidth: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            color: '#fff',
            textAlign: 'center',
          }}>
            <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: 700 }}>Confirm Deposit</h2>
            <div style={{ marginBottom: '16px', fontSize: '16px' }}>
              You are about to deposit:
              <br />
              <strong>{pendingDeposit.amount1} {pendingDeposit.token1}</strong> + <strong>{pendingDeposit.amount2} {pendingDeposit.token2}</strong>
            </div>
            <div style={{ marginBottom: '16px', fontSize: '15px', color: '#FFB366' }}>
              <div>Fee: <strong>${pendingDeposit.fee.toFixed(4)}</strong></div>
              <div>Platform Fee: <strong>${pendingDeposit.platformFee.toFixed(4)}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
              <button
                onClick={confirmDeposit}
                style={{
                  background: '#00E676',
                  color: '#1a1a2e',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >Confirm</button>
              <button
                onClick={() => { setShowConfirmModal(false); setPendingDeposit(null); }}
                style={{
                  background: '#FF5252',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        {/* Back Button */}
        <button
          onClick={onNavigateToPoolsList}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '10px 20px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
            transition: 'all 0.2s',
            fontFamily: "'Space Grotesk', sans-serif"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = '#FF6B00';
            e.currentTarget.style.color = '#FF6B00';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = '#fff';
          }}
        >
          <ArrowLeft size={16} />
          All Pools
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 450px',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          {/* Left Column - Pool Info */}
          <div>
            {/* Pool Header */}
            <div style={{
              background: 'rgba(20, 20, 40, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}>
                    {pool.name}
                  </h1>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    <span>{pool.protocol}</span>
                    <span>•</span>
                    <span>{pool.network}</span>
                  </div>
                </div>

                {/* Risk Badge */}
                <div style={{
                  background: riskData.bgColor,
                  border: `1px solid ${riskData.borderColor}`,
                  borderRadius: '12px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: riskData.color
                }}>
                  <RiskIcon size={18} />
                  {riskData.label}
                </div>
              </div>

              {/* Tokens */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {pool.tokens.map(token => (
                  <div
                    key={token}
                    style={{
                      background: 'rgba(255, 107, 0, 0.1)',
                      border: '1px solid rgba(255, 107, 0, 0.3)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#FF6B00'
                    }}
                  >
                    {token}
                  </div>
                ))}
              </div>

              {/* Description */}
              <p style={{
                color: '#ccc',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                {pool.description}
              </p>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <div style={{ color: '#999', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>
                    APY
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#00E676',
                    fontFamily: "'SF Mono', monospace"
                  }}>
                    {pool.apy}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#999', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>
                    Total Value Locked
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    fontFamily: "'SF Mono', monospace"
                  }}>
                    {pool.tvl}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#999', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>
                    24h Volume
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    fontFamily: "'SF Mono', monospace"
                  }}>
                    {pool.volume24h}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#999', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>
                    24h Fees
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    fontFamily: "'SF Mono', monospace"
                  }}>
                    {pool.fees24h}
                  </div>
                </div>
              </div>

              {/* Contract Link */}
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px'
                }}>
                  <div>
                    <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>
                      Contract Address
                    </div>
                    <div style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: '13px',
                      color: '#fff'
                    }}>
                      {pool.contract.slice(0, 10)}...{pool.contract.slice(-8)}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`https://etherscan.io/address/${pool.contract}`, '_blank')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FF6B00',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 107, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Etherscan
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* My Position */}
            <div style={{
              background: 'rgba(20, 20, 40, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: '0 0 20px 0',
                fontFamily: "'Space Grotesk', sans-serif"
              }}>
                My Position
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <div style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>
                    Staked
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#00E676',
                    fontFamily: "'SF Mono', monospace"
                  }}>
                    ${pool.myStake}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <div style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>
                    Earnings
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FFA726',
                    fontFamily: "'SF Mono', monospace"
                  }}>
                    ${pool.myEarnings}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Deposit/Withdraw */}
          <div style={{
            background: 'rgba(20, 20, 40, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            position: 'sticky',
            top: '100px'
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '4px'
            }}>
              <button
                onClick={() => setActiveTab('deposit')}
                style={{
                  flex: 1,
                  background: activeTab === 'deposit' ? '#FF6B00' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Space Grotesk', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                style={{
                  flex: 1,
                  background: activeTab === 'withdraw' ? '#FF6B00' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Space Grotesk', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Minus size={16} />
                Withdraw
              </button>
            </div>

            {activeTab === 'deposit' ? (
              <>
                {/* Info Banner */}
                <div style={{
                  background: 'rgba(255, 107, 0, 0.1)',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <Info size={18} color="#FF6B00" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#FFB366'
                  }}>
                    Equal value of both tokens is required to provide liquidity.
                  </p>
                </div>

                {/* Token 1 Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    color: '#999',
                    fontSize: '13px',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    {pool.tokens[0]} Amount
                  </label>
                  <input
                    type="text"
                    value={token1Amount}
                    onChange={(e) => setToken1Amount(e.target.value)}
                    placeholder="0.0"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      color: '#fff',
                      fontSize: '18px',
                      fontFamily: "'SF Mono', monospace",
                      fontWeight: '600',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Token 2 Input */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    color: '#999',
                    fontSize: '13px',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    {pool.tokens[1]} Amount
                  </label>
                  <input
                    type="text"
                    value={token2Amount}
                    onChange={(e) => setToken2Amount(e.target.value)}
                    placeholder="0.0"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      color: '#fff',
                      fontSize: '18px',
                      fontFamily: "'SF Mono', monospace",
                      fontWeight: '600',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={handleDeposit}
                  style={{
                    width: '100%',
                    background: '#FF6B00',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#FF8533'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#FF6B00'}
                >
                  Add Liquidity
                </button>
              </>
            ) : (
              <>
                {/* Withdraw Info */}
                <div style={{
                  background: 'rgba(255, 82, 82, 0.1)',
                  border: '1px solid rgba(255, 82, 82, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <Info size={18} color="#FF5252" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#FFB3B3'
                  }}>
                    You can withdraw your liquidity by burning your LP tokens.
                  </p>
                </div>

                {/* Withdraw Percentage Slider */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <label style={{
                      color: '#999',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      Withdrawal Amount
                    </label>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#FF6B00',
                      fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                      {withdrawPercentage}%
                    </div>
                  </div>

                  {/* Slider */}
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={withdrawPercentage}
                      onChange={(e) => setWithdrawPercentage(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: '8px',
                        borderRadius: '4px',
                        outline: 'none',
                        background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${withdrawPercentage}%, rgba(255, 255, 255, 0.1) ${withdrawPercentage}%, rgba(255, 255, 255, 0.1) 100%)`,
                        WebkitAppearance: 'none',
                        cursor: 'pointer'
                      }}
                      className="custom-slider"
                    />
                    <style>{`
                      .custom-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        background: #FF6B00;
                        cursor: pointer;
                        border: 3px solid #1a1a2e;
                        box-shadow: 0 4px 12px rgba(255, 107, 0, 0.4);
                        transition: all 0.2s;
                      }
                      .custom-slider::-webkit-slider-thumb:hover {
                        transform: scale(1.2);
                        box-shadow: 0 6px 16px rgba(255, 107, 0, 0.6);
                      }
                      .custom-slider::-moz-range-thumb {
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        background: #FF6B00;
                        cursor: pointer;
                        border: 3px solid #1a1a2e;
                        box-shadow: 0 4px 12px rgba(255, 107, 0, 0.4);
                        transition: all 0.2s;
                      }
                      .custom-slider::-moz-range-thumb:hover {
                        transform: scale(1.2);
                        box-shadow: 0 6px 16px rgba(255, 107, 0, 0.6);
                      }
                    `}</style>
                  </div>

                  {/* Amount Display */}
                  <div style={{
                    background: 'rgba(255, 107, 0, 0.1)',
                    border: '1px solid rgba(255, 107, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: '#999'
                      }}>
                        LP Token Amount:
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#fff',
                        fontFamily: "'SF Mono', monospace"
                      }}>
                        {(0 * withdrawPercentage / 100).toFixed(4)} LP
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: '#999'
                      }}>
                        Estimated Value:
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#00E676',
                        fontFamily: "'SF Mono', monospace"
                      }}>
                        ${(0 * withdrawPercentage / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={withdrawPercentage === 0}
                  style={{
                    width: '100%',
                    background: withdrawPercentage === 0 ? 'rgba(255, 82, 82, 0.3)' : '#FF5252',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: withdrawPercentage === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                  onMouseOver={(e) => {
                    if (withdrawPercentage > 0) {
                      e.currentTarget.style.background = '#FF7070';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (withdrawPercentage > 0) {
                      e.currentTarget.style.background = '#FF5252';
                    }
                  }}
                >
                  {withdrawPercentage === 0 ? 'Select Amount' : `Withdraw ${withdrawPercentage}% Liquidity`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
