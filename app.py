from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from geckoterminal_py import GeckoTerminalAsyncClient
import asyncio


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/gecko/networks")
async def get_gecko_data():
    client = GeckoTerminalAsyncClient()
    networks_df = await client.get_networks()
    return {"networks": networks_df.to_dict()}

@app.get("/gecko/address/{network_id}")
async def get_address_data(network_id: str):
    client = GeckoTerminalAsyncClient()
    address_df = await client.get_top_pools_by_network(network_id)
    return {"address_data": address_df.to_dict()}

@app.get("/gecko/pool/usdt")
async def get_pool_data():
    client = GeckoTerminalAsyncClient()
    pool_df = await client.get_top_pools_by_network_token("sepolia-testnet", "0x03efd625304e7119b80463be5a677c121c2232bc")
    return {"pool_data": pool_df.to_dict()}