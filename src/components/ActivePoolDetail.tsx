import { useState } from 'react';
import { ArrowLeft, TrendingUp, Minus, Info } from 'lucide-react';

interface ActivePoolDetailProps {
  pool: {
    name: string;
    protocol: string;
    apy: string;
    staked: string;
    earnings: string;
    color: string;
  };
  onBack: () => void;
  onWithdraw: (amount: string) => void;
}

export default function ActivePoolDetail({ pool, onBack, onWithdraw }: ActivePoolDetailProps) {
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleWithdraw = (percentage: number) => {
    const stakedValue = parseFloat(pool.staked.replace('$', '').replace(',', ''));
    const earningsValue = parseFloat(pool.earnings.replace('+$', ''));
    const totalValue = stakedValue + earningsValue;
    const amount = (totalValue * percentage / 100).toFixed(2);
    
    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw ${percentage}% from ${pool.name} pool?\n\nWithdraw Amount: $${amount}\n(Stake: $${(stakedValue * percentage / 100).toFixed(2)} + Earnings: $${(earningsValue * percentage / 100).toFixed(2)})`
    );
    
    if (confirmWithdraw) {
      onWithdraw(amount);
      alert(`✅ Success!\n\n$${amount} has been transferred to your wallet.`);
      onBack();
    }
  };

  const stakedValue = parseFloat(pool.staked.replace('$', '').replace(',', ''));
  const earningsValue = parseFloat(pool.earnings.replace('+$', ''));
  const totalValue = stakedValue + earningsValue;

  const handlePercentageChange = (percentage: number) => {
    setWithdrawPercentage(percentage);
    const amount = (totalValue * percentage / 100).toFixed(2);
    setWithdrawAmount(amount);
  };

  const handleAmountChange = (amount: string) => {
    setWithdrawAmount(amount);
    const numAmount = parseFloat(amount) || 0;
    const percentage = Math.min(100, Math.round((numAmount / totalValue) * 100));
    setWithdrawPercentage(percentage);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}
    onClick={onBack}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.98) 0%, rgba(15, 15, 30, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = pool.color;
              e.currentTarget.style.color = pool.color;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#fff'
            }}>
              {pool.name}
            </h2>
            <div style={{
              fontSize: '14px',
              color: '#999'
            }}>
              {pool.protocol}
            </div>
          </div>
          <div style={{
            background: `${pool.color}20`,
            border: `1px solid ${pool.color}40`,
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <TrendingUp size={18} color={pool.color} />
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              color: pool.color,
              fontFamily: "'SF Mono', monospace"
            }}>
              {pool.apy}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Staked
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#fff',
              fontFamily: "'SF Mono', monospace"
            }}>
              {pool.staked}
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Earnings
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: pool.color,
              fontFamily: "'SF Mono', monospace"
            }}>
              {pool.earnings}
            </div>
          </div>

          <div style={{
            background: `${pool.color}15`,
            border: `1px solid ${pool.color}30`,
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: pool.color,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Total Value
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: pool.color,
              fontFamily: "'SF Mono', monospace"
            }}>
              ${totalValue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          background: 'rgba(255, 107, 0, 0.1)',
          border: '1px solid rgba(255, 107, 0, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <Info size={20} color="#FF6B00" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#FFB366' }}>
            You can withdraw your liquidity at any time. Your earnings will be automatically added to your principal amount.
          </div>
        </div>

        {/* Withdraw Section */}
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '24px',
            fontFamily: "'Space Grotesk', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Minus size={20} color="#FF6B00" />
            Withdraw Amount
          </h3>

          {/* Percentage Display */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#999',
              fontWeight: '600'
            }}>
              Withdrawal Percentage
            </span>
            <span style={{
              fontSize: '32px',
              fontWeight: '700',
              color: pool.color,
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              {withdrawPercentage}%
            </span>
          </div>

          {/* Slider */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={withdrawPercentage}
              onChange={(e) => handlePercentageChange(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                background: `linear-gradient(to right, ${pool.color} 0%, ${pool.color} ${withdrawPercentage}%, rgba(255, 255, 255, 0.1) ${withdrawPercentage}%, rgba(255, 255, 255, 0.1) 100%)`,
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
                background: ${pool.color};
                cursor: pointer;
                border: 3px solid #1a1a2e;
                box-shadow: 0 4px 12px ${pool.color}66;
                transition: all 0.2s;
              }
              .custom-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 6px 16px ${pool.color}99;
              }
              .custom-slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${pool.color};
                cursor: pointer;
                border: 3px solid #1a1a2e;
                box-shadow: 0 4px 12px ${pool.color}66;
                transition: all 0.2s;
              }
              .custom-slider::-moz-range-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 6px 16px ${pool.color}99;
              }
            `}</style>
          </div>

          {/* Amount Display */}
          <div style={{
            background: `${pool.color}15`,
            border: `1px solid ${pool.color}40`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#999',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>
              Withdrawal Amount
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                color: pool.color
              }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                value={withdrawAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  if (value.split('.').length <= 2) {
                    handleAmountChange(value);
                  }
                }}
                placeholder="0.00"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: `2px solid ${pool.color}60`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '36px',
                  fontWeight: '700',
                  color: pool.color,
                  fontFamily: "'SF Mono', monospace",
                  width: '280px',
                  textAlign: 'center',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = pool.color;
                  e.currentTarget.style.boxShadow = `0 0 0 4px ${pool.color}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${pool.color}60`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              textAlign: 'center'
            }}>
              Stake: ${(stakedValue * withdrawPercentage / 100).toFixed(2)} + Earnings: ${(earningsValue * withdrawPercentage / 100).toFixed(2)}
            </div>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={() => handleWithdraw(withdrawPercentage)}
            disabled={withdrawPercentage === 0}
            style={{
              width: '100%',
              background: withdrawPercentage === 0 ? 'rgba(255, 82, 82, 0.3)' : `linear-gradient(135deg, ${pool.color} 0%, ${pool.color}CC 100%)`,
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '700',
              cursor: withdrawPercentage === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: '24px'
            }}
            onMouseOver={(e) => {
              if (withdrawPercentage > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${pool.color}66`;
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {withdrawPercentage === 0 ? 'Select Amount' : `Withdraw ${withdrawPercentage}% Liquidity`}
          </button>

          {/* Pool Performance Info */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '24px'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#999',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Pool Performance
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#666' }}>ROI (Total)</span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: pool.color,
                fontFamily: "'SF Mono', monospace"
              }}>
                +{((earningsValue / stakedValue) * 100).toFixed(2)}%
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Time in Pool</span>
              <span style={{ fontSize: '13px', color: '#fff', fontFamily: "'SF Mono', monospace" }}>
                12 days
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Est. Daily Earnings</span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#00E676',
                fontFamily: "'SF Mono', monospace"
              }}>
                +${(earningsValue / 12).toFixed(2)}/day
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
