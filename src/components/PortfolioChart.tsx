import { useState } from 'react';
import React from 'react';

type CoinSymbol = 'ETH' | 'SOL' | 'USDT' | 'USDC';

export default function PortfolioChart() {
  // Coin list and mock balances
  const coins: { symbol: CoinSymbol; name: string; icon: string }[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      icon: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
  ];

  const LS_KEY = 'portfolioBalances';
  const defaultBalances: Record<CoinSymbol, number> = {
    ETH: 1.234,
    SOL: 12.45,
    USDT: 2043.12,
    USDC: 3824.37,
  };

  const [balances, setBalances] = useState<Record<CoinSymbol, number>>(defaultBalances);

  // Load balances from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setBalances(JSON.parse(stored));
      } catch {}
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify(defaultBalances));
    }
  }, []);

  // Calculate total value (mock prices)
  const prices: Record<CoinSymbol, number> = {
    ETH: 2047.41,
    SOL: 63.12,
    USDT: 1.00,
    USDC: 1.00,
  };
  const totalValue = coins.reduce((sum, coin) => sum + (balances[coin.symbol] || 0) * prices[coin.symbol], 0);

  return (
    <div style={{
      background: 'rgba(20, 20, 35, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '40px',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 340
    }}>
      {/* Top Balance Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: '#999', fontWeight: 500, marginBottom: 6 }}>Est. Total Value</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace" }}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button style={{
          background: '#FFD600',
          color: '#222',
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          borderRadius: 12,
          padding: '10px 22px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>Add Funds</button>
      </div>

      {/* Watchlist Table */}
      <div style={{ marginTop: 12 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: '8px',
          color: '#999',
          fontSize: '13px',
          fontWeight: '600',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: '8px',
          marginBottom: '2px'
        }}>
          <span>Coin</span>
          <span>Price</span>
          <span>Balance</span>
        </div>
        {coins.map((coin) => (
          <div key={coin.symbol} style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={coin.icon} alt={coin.symbol} style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{coin.name}</span>
              <span style={{ color: '#999', fontSize: '13px', marginLeft: 4 }}>{coin.symbol}</span>
            </div>
            <div style={{ fontFamily: "'SF Mono', 'Monaco', monospace", color: '#fff', fontWeight: 600, fontSize: '15px' }}>
              ${prices[coin.symbol].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontFamily: "'SF Mono', 'Monaco', monospace", color: '#FFD600', fontWeight: 700, fontSize: '15px' }}>
              {balances[coin.symbol]?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
