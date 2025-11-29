import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChartProps {
  symbol?: 'BTC' | 'ETH' | 'SOL' | 'TRX';
}

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

export default function PriceChart({ symbol = 'BTC' }: PriceChartProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'SOL' | 'TRX'>(symbol);
  const [cryptoData, setCryptoData] = useState<Record<'BTC' | 'ETH' | 'SOL' | 'TRX', CryptoData>>({
    BTC: {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 0,
      change24h: 0,
      sparkline: []
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 0,
      change24h: 0,
      sparkline: []
    },
    SOL: {
      symbol: 'SOL',
      name: 'Solana',
      price: 0,
      change24h: 0,
      sparkline: []
    },
    TRX: {
      symbol: 'TRX',
      name: 'Tron',
      price: 0,
      change24h: 0,
      sparkline: []
    }
  });
  const [loading, setLoading] = useState(true);

  const currentData = cryptoData[selectedCrypto];
  const isPositive = currentData.change24h >= 0;

  // Normalize sparkline data for SVG path
  const normalizeSparkline = (data: number[]) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    return data.map(val => ((val - min) / range) * 100);
  };

  const createSparklinePath = (data: number[]) => {
    const normalized = normalizeSparkline(data);
    const width = 100;
    const height = 100;
    const step = width / (data.length - 1);
    
    let path = `M 0 ${height - normalized[0]}`;
    for (let i = 1; i < normalized.length; i++) {
      path += ` L ${step * i} ${height - normalized[i]}`;
    }
    return path;
  };

  // Fetch real-time crypto data from CoinGecko API
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,tron&order=market_cap_desc&per_page=4&page=1&sparkline=true&price_change_percentage=24h'
        );
        const data = await response.json();
        
        const btcData = data.find((coin: any) => coin.id === 'bitcoin');
        const ethData = data.find((coin: any) => coin.id === 'ethereum');
        const solData = data.find((coin: any) => coin.id === 'solana');
        const trxData = data.find((coin: any) => coin.id === 'tron');
        
        setCryptoData({
          BTC: {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: btcData?.current_price || 0,
            change24h: btcData?.price_change_percentage_24h || 0,
            sparkline: btcData?.sparkline_in_7d?.price?.slice(-24) || []
          },
          ETH: {
            symbol: 'ETH',
            name: 'Ethereum',
            price: ethData?.current_price || 0,
            change24h: ethData?.price_change_percentage_24h || 0,
            sparkline: ethData?.sparkline_in_7d?.price?.slice(-24) || []
          },
          SOL: {
            symbol: 'SOL',
            name: 'Solana',
            price: solData?.current_price || 0,
            change24h: solData?.price_change_percentage_24h || 0,
            sparkline: solData?.sparkline_in_7d?.price?.slice(-24) || []
          },
          TRX: {
            symbol: 'TRX',
            name: 'Tron',
            price: trxData?.current_price || 0,
            change24h: trxData?.price_change_percentage_24h || 0,
            sparkline: trxData?.sparkline_in_7d?.price?.slice(-24) || []
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setLoading(false);
      }
    };

    fetchCryptoData();
    
    // Update every 60 seconds
    const interval = setInterval(fetchCryptoData, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'rgba(20, 20, 35, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '32px',
      backdropFilter: 'blur(10px)',
      height: '100%'
    }}>
      {/* Header with Crypto Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: 0,
          fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: '-0.02em'
        }}>
          Market Price
        </h2>
        
        {/* Crypto Toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <button
            onClick={() => setSelectedCrypto('BTC')}
            style={{
              background: selectedCrypto === 'BTC' ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
              border: selectedCrypto === 'BTC' ? '1px solid #FF6B00' : '1px solid transparent',
              color: selectedCrypto === 'BTC' ? '#FF6B00' : '#999',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
          >
            BTC
          </button>
          <button
            onClick={() => setSelectedCrypto('ETH')}
            style={{
              background: selectedCrypto === 'ETH' ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
              border: selectedCrypto === 'ETH' ? '1px solid #FF6B00' : '1px solid transparent',
              color: selectedCrypto === 'ETH' ? '#FF6B00' : '#999',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
          >
            ETH
          </button>
          <button
            onClick={() => setSelectedCrypto('SOL')}
            style={{
              background: selectedCrypto === 'SOL' ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
              border: selectedCrypto === 'SOL' ? '1px solid #FF6B00' : '1px solid transparent',
              color: selectedCrypto === 'SOL' ? '#FF6B00' : '#999',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
          >
            SOL
          </button>
          <button
            onClick={() => setSelectedCrypto('TRX')}
            style={{
              background: selectedCrypto === 'TRX' ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
              border: selectedCrypto === 'TRX' ? '1px solid #FF6B00' : '1px solid transparent',
              color: selectedCrypto === 'TRX' ? '#FF6B00' : '#999',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
          >
            TRX
          </button>
        </div>
      </div>

      {/* Price Info */}
      <div style={{ marginBottom: '24px' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            color: '#666'
          }}>
            Loading...
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#999',
                fontWeight: '500'
              }}>
                {currentData.name}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#666',
                fontFamily: "'SF Mono', 'Monaco', monospace"
              }}>
                {currentData.symbol}/USD
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '36px',
                fontWeight: '700',
                fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em'
              }}>
                ${currentData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: isPositive ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${isPositive ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`
              }}>
                {isPositive ? <TrendingUp size={16} color="#00E676" /> : <TrendingDown size={16} color="#ff4444" />}
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isPositive ? '#00E676' : '#ff4444'
                }}>
                  {isPositive ? '+' : ''}{currentData.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sparkline Chart */}
      {!loading && currentData.sparkline.length > 0 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '20px',
          height: '200px',
          position: 'relative'
        }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id={`gradient-${selectedCrypto}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: isPositive ? '#00E676' : '#ff4444', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: isPositive ? '#00E676' : '#ff4444', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            
            {/* Area under the line */}
            <path
              d={`${createSparklinePath(currentData.sparkline)} L 100 100 L 0 100 Z`}
              fill={`url(#gradient-${selectedCrypto})`}
            />
            
            {/* Line */}
            <path
              d={createSparklinePath(currentData.sparkline)}
              fill="none"
              stroke={isPositive ? '#00E676' : '#ff4444'}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          
          {/* Time Labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
            fontSize: '11px',
            color: '#666',
            fontFamily: "'SF Mono', 'Monaco', monospace"
          }}>
            <span>24h ago</span>
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* Stats Row */}
      {!loading && currentData.sparkline.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '20px'
        }}>
          {[
            { label: '24h High', value: `$${Math.max(...currentData.sparkline).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            { label: '24h Low', value: `$${Math.min(...currentData.sparkline).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            { label: 'Current', value: `$${currentData.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#666',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
