import { useState, useEffect } from 'react';

// Coin Tipleri
type CoinSymbol = 'ETH' | 'SOL' | 'USDT' | 'USDC';

interface CoinData {
  symbol: CoinSymbol;
  name: string;
  icon: string;
}

export default function PortfolioChart() {
  // Coin Listesi ve İkonlar
  const coins: CoinData[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond-purple.svg?v=040',
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
  
  // Varsayılan Bakiyeler (Demo Amaçlı)
  const defaultBalances: Record<CoinSymbol, number> = {
    ETH: 1.234,
    SOL: 12.45,
    USDT: 2043.12,
    USDC: 3824.37,
  };

  const [balances, setBalances] = useState<Record<CoinSymbol, number>>(defaultBalances);
  
  // Fiyatlar
  const [prices, setPrices] = useState<Record<CoinSymbol, number>>({
    ETH: 0,
    SOL: 0,
    USDT: 1.00,
    USDC: 1.00,
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 1. LocalStorage'dan Bakiyeleri Yükle
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setBalances(JSON.parse(stored));
      } catch {}
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify(defaultBalances));
    }
  }, []);

  // 2. Canlı Fiyatları Çek (Fallback: CoinGecko API)
  // WDK Pricing paketi public npm'de olmadığı için standart fetch kullanıyoruz.
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        console.log("Fiyatlar güncelleniyor...");
        
        // CoinGecko basit API (API Key gerektirmez, demo için yeterlidir)
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,tether,usd-coin&vs_currencies=usd'
        );
        
        if (!response.ok) throw new Error('API Hatası');
        
        const data = await response.json();

        setPrices({
          ETH: data.ethereum.usd || 0,
          SOL: data.solana.usd || 0,
          USDT: data.tether.usd || 1.00,
          USDC: data['usd-coin'].usd || 1.00,
        });
        setLastUpdated(new Date());
        
      } catch (e) {
        console.error("Fiyat çekme hatası:", e);
        // Hata durumunda (Rate limit vs.) eski fiyatlar kalır
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    // Her 60 saniyede bir güncelle
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Toplam Portföy Değeri
  const totalValue = coins.reduce((sum, coin) => {
    return sum + (balances[coin.symbol] || 0) * (prices[coin.symbol] || 0);
  }, 0);

  return (
    <div style={{
      background: 'rgba(20, 20, 35, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '32px',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '340px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* Üst Kısım: Toplam Bakiye */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: 500, marginBottom: '4px', display:'flex', alignItems:'center', gap:'6px' }}>
            <span>Total Balance</span>
            {lastUpdated && !loading && (
                <span style={{width: 6, height: 6, borderRadius:'50%', background:'#28a745', display:'inline-block'}} title="Live"></span>
            )}
          </div>
          <div style={{ 
              fontSize: '36px', 
              fontWeight: 700, 
              color: '#fff', 
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-1px'
          }}>
            {loading && totalValue === 0 ? (
                <span style={{opacity:0.5}}>Updating...</span>
            ) : (
                `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </div>
        </div>
        
        <button style={{
          background: 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)',
          color: '#000',
          fontWeight: 700,
          fontSize: '14px',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 20px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          + Add Funds
        </button>
      </div>

      {/* Coin Listesi */}
      <div style={{ marginTop: '8px' }}>
        
        {/* Başlıklar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr',
          gap: '12px',
          color: '#666',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '8px'
        }}>
          <span>Asset</span>
          <span style={{textAlign:'right'}}>Price</span>
          <span style={{textAlign:'right'}}>Value</span>
        </div>

        {/* Satırlar */}
        {coins.map((coin) => {
            const price = prices[coin.symbol];
            const balance = balances[coin.symbol];
            const value = price * balance;

            return (
              <div key={coin.symbol} style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                transition: 'background 0.2s',
              }}>
                {/* Sol: İkon + İsim */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={coin.icon} 
                    alt={coin.symbol} 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background:'#fff' }} 
                  />
                  <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{coin.name}</span>
                    <span style={{ color: '#666', fontSize: '12px' }}>{coin.symbol}</span>
                  </div>
                </div>

                {/* Orta: Fiyat */}
                <div style={{ textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif", color: '#ccc', fontSize: '14px' }}>
                  ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* Sağ: Bakiye Değeri */}
                <div style={{ textAlign: 'right', display:'flex', flexDirection:'column' }}>
                   <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                      ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                   <span style={{ fontSize: '12px', color: '#666' }}>
                      {balance} {coin.symbol}
                   </span>
                </div>
              </div>
            );
        })}
      </div>
      
      <div style={{marginTop: '20px', textAlign:'center', fontSize:'11px', color:'#444'}}>
        Live prices via CoinGecko API
      </div>
    </div>
  );
}