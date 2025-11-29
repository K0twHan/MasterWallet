import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';

type Chain = 'ethereum' | 'bitcoin' | 'solana';

interface WalletInfo {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface WalletSelectorProps {
  wallets: WalletInfo;
  selectedChain: Chain;
  onChainChange: (chain: Chain) => void;
}

const chainConfig = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    logo: 'https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond-purple.svg?v=040',
    network: 'ETH Testnet'
  },
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#F7931A',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    network: 'BTC Testnet'
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    color: '#14F195',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    network: 'SOL Devnet'
  }
};

export default function WalletSelector({ wallets, selectedChain, onChainChange }: WalletSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedChain, setCopiedChain] = useState<Chain | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAddress = (address: string, chain: Chain) => {
    if (!address) return 'Loading...';
    if (chain === 'bitcoin') {
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = (address: string, chain: Chain, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedChain(chain);
    setTimeout(() => setCopiedChain(null), 2000);
  };

  const currentChain = chainConfig[selectedChain];

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Network Badge */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: currentChain.color,
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
        letterSpacing: '-0.01em',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={() => setIsOpen(!isOpen)}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.borderColor = currentChain.color;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: currentChain.color
        }} />
        <img 
          src={currentChain.logo} 
          alt={currentChain.name}
          style={{
            width: '20px',
            height: '20px',
            objectFit: 'contain'
          }}
        />
        <span>{currentChain.network}</span>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'rgba(20, 20, 35, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px',
          minWidth: '320px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            padding: '12px 8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '8px'
          }}>
            <span style={{
              color: '#999',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              Select Network
            </span>
          </div>

          {(Object.keys(chainConfig) as Chain[]).map((chain) => {
            const config = chainConfig[chain];
            const address = wallets[chain];
            const isSelected = selectedChain === chain;
            const isCopied = copiedChain === chain;

            return (
              <button
                key={chain}
                onClick={() => {
                  onChainChange(chain);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  background: isSelected ? `${config.color}15` : 'transparent',
                  border: isSelected ? `1px solid ${config.color}` : '1px solid transparent',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: `${config.color}20`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    flexShrink: 0
                  }}>
                    <img 
                      src={config.logo} 
                      alt={config.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: isSelected ? config.color : '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                      marginBottom: '2px'
                    }}>
                      {config.name}
                    </div>
                    <div style={{
                      color: '#999',
                      fontSize: '12px',
                      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                      fontWeight: '500',
                      letterSpacing: '-0.02em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatAddress(address, chain)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => copyAddress(address, chain, e)}
                  style={{
                    background: isCopied ? `${config.color}30` : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    color: isCopied ? config.color : '#999',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#999';
                    }
                  }}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </button>
            );
          })}

          <div style={{
            marginTop: '8px',
            padding: '12px',
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.2)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#FF6B00',
            lineHeight: '1.5',
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            <strong>Multi-Chain:</strong> All wallets use the same seed phrase
          </div>
        </div>
      )}
    </div>
  );
}
