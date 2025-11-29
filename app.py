from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from geckoterminal_py import GeckoTerminalAsyncClient
import pandas as pd
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- YARDIMCI FONKSİYONLAR (Data Transformer) ---
# Bu fonksiyonlar veriyi "Güzelleştirmek" için backend tarafında çalışır.

def format_currency(value):
    """Sayıları $1.2M veya $500K formatına çevirir."""
    try:
        val = float(value)
        if val >= 1_000_000:
            return f"${val/1_000_000:.2f}M"
        elif val >= 1_000:
            return f"${val/1_000:.2f}K"
        return f"${val:.2f}"
    except (ValueError, TypeError):
        return "$0.00"

def calculate_risk(tvl_usd: float, price_change: float) -> dict:
    """TVL ve volatiliteye göre basit bir risk etiketi üretir."""
    # Mantık: TVL 50k altındaysa veya günlük değişim %10'dan fazlaysa riskli.
    if tvl_usd < 50_000 or abs(price_change) > 10:
        return {"label": "High Risk", "color": "red", "description": "High volatility, low liquidity."}
    elif tvl_usd < 200_000:
        return {"label": "Moderate Risk", "color": "orange", "description": "Moderate volatility."}
    else:
        return {"label": "Safe", "color": "green", "description": "Stable liquidity pool."}

# --- ENDPOINTLER ---

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/gecko/networks")
async def get_gecko_data():
    client = GeckoTerminalAsyncClient()
    networks_df = await client.get_networks()
    # Not: Client'ı kapatmak iyi bir pratiktir, context manager yoksa manuel kapatılabilir.
    return {"networks": networks_df.to_dict()}

@app.get("/gecko/address/{network_id}")
async def get_address_data(network_id: str):
    client = GeckoTerminalAsyncClient()
    address_df = await client.get_top_pools_by_network(network_id)
    return {"address_data": address_df.to_dict()}

# --- GÜNCELLENEN ANA ENDPOINT ---
@app.get("/gecko/pool/usdt")
async def get_pool_data():
    client = GeckoTerminalAsyncClient()
    
    # 1. Veriyi Çek
    pool_df = await client.get_top_pools_by_network_token("sepolia-testnet", "0x03efd625304e7119b80463be5a677c121c2232bc")
    
    # 2. Veri Dönüştürme (Transformation)
    # DataFrame boşsa boş liste dön
    if pool_df.empty:
        return {"ui_data": []}

    # NaN (Boş) değerleri 0 ile doldur, yoksa JSON patlar
    pool_df = pool_df.fillna(0)
    
    formatted_pools = []

    # Her satırı (havuzu) tek tek işleyip UI formatına sokuyoruz
    for _, row in pool_df.iterrows():
        
        # Ham verileri al
        tvl_val = float(row.get("reserve_in_usd", 0))
        price_change = float(row.get("price_change_percentage_h24", 0))
        volume_val = float(row.get("volume_usd_h24", 0))
        raw_name = row.get("name", "Unknown Pool") # Örn: "USDT / WETH 0.05%"

        # Token isimlerini ayıkla (Split et)
        # "USDT / WETH 0.05%" -> ["USDT", "WETH"]
        try:
            tokens = raw_name.split(" / ")[:2] 
            # Bazen yüzde işareti token ismine yapışık kalabilir, temizleyelim
            tokens = [t.split(" ")[0] for t in tokens]
        except:
            tokens = ["Token A", "Token B"]

        # Risk hesapla
        risk_status = calculate_risk(tvl_val, price_change)

        # UI Kart Objesi
        pool_card = {
            "id": row.get("id"),
            "title": f"{tokens[0]}-{tokens[1]} Pool" if len(tokens) > 1 else raw_name,
            "sub_title": f"Uniswap V3 • Sepolia", # Dinamik de yapılabilir: row.get('dex_id')
            "tags": tokens, # Frontend'de turuncu kutucuklar olacak
            "badge": risk_status, # Frontend'de Safe/High Risk butonu olacak
            "metrics": {
                "apy": {
                    "label": "APY", 
                    "value": f"%{abs(price_change):.1f}", # GECİCİ: APY verisi olmadığı için değişim oranını koyduk
                    "color": "green" if price_change >= 0 else "red"
                },
                "tvl": {
                    "label": "TVL",
                    "value": format_currency(tvl_val) # "$125M" gibi
                },
                "volume": {
                    "label": "24h Volume",
                    "value": format_currency(volume_val)
                }
            },
            "description": risk_status["description"],
            "contract_address": str(row.get("address", "")),
            # Görselde olmayan ama işine yarayacak ham veriler:
            "raw_data": {
                "base_token_id": row.get("base_token_id"),
                "quote_token_id": row.get("quote_token_id")
            }
        }
        
        formatted_pools.append(pool_card)

    # 3. Temizlenmiş Listeyi Dön
    return {"data": formatted_pools}