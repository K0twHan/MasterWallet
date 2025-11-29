/**
 * Wallet Service - Multi-chain wallet management using Tether WDK SDK
 * Supports: Sepolia Testnet (EVM) and Solana Testnet
 */

import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import WalletManagerSolana from "@tetherto/wdk-wallet-solana";

// Network configurations
export const NETWORKS = {
  // EVM Networks
  sepolia: {
    name: "Sepolia Testnet",
    chainId: 11155111,
    rpc: "https://sepolia.drpc.org",
    explorer: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
    tokens: {
      WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      USDT: "0xd077a400968890eacc75cdc901f0356c943e4fdb", // Official WDK Mock USDT
      USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    },
    faucets: [
      "https://dashboard.pimlico.io/test-erc20-faucet",
      "https://dashboard.candide.dev/faucet",
      "https://sepoliafaucet.com",
    ],
  },
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpc: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    tokens: {
      WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    faucets: [],
  },
  // Solana Networks
  "solana-testnet": {
    name: "Solana Testnet",
    rpc: "https://api.testnet.solana.com",
    ws: "wss://api.testnet.solana.com/",
    explorer: "https://explorer.solana.com/?cluster=testnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    tokens: {
      // Solana testnet doesn't have standard mock tokens like EVM
      // These would need to be created or use devnet tokens
    },
    faucets: ["https://faucet.solana.com/"],
  },
  "solana-devnet": {
    name: "Solana Devnet",
    rpc: "https://api.devnet.solana.com",
    ws: "wss://api.devnet.solana.com/",
    explorer: "https://explorer.solana.com/?cluster=devnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    tokens: {},
    faucets: ["https://faucet.solana.com/"],
  },
  "solana-mainnet": {
    name: "Solana Mainnet",
    rpc: "https://api.mainnet-beta.solana.com",
    ws: "wss://api.mainnet-beta.solana.com/",
    explorer: "https://explorer.solana.com",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    tokens: {
      USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    },
    faucets: [],
  },
};

export type NetworkKey = keyof typeof NETWORKS;
export type EVMNetworkKey = "sepolia" | "ethereum";
export type SolanaNetworkKey =
  | "solana-testnet"
  | "solana-devnet"
  | "solana-mainnet";

// Token decimals
export const TOKEN_DECIMALS: { [key: string]: number } = {
  WETH: 18,
  ETH: 18,
  USDT: 6,
  USDC: 6,
  DAI: 18,
  SOL: 9,
};

export interface TransactionResult {
  hash: string;
  fee: bigint;
  from: string;
  to: string;
  value: bigint;
  network: string;
}

export interface TransferResult {
  hash: string;
  fee: bigint;
  tokenInAmount?: bigint;
  tokenOutAmount?: bigint;
}

export interface QuoteResult {
  fee: bigint;
  tokenOutAmount?: bigint;
}

// EVM Wallet Service
export class EVMWalletService {
  private walletManager: WalletManagerEvm | null = null;
  private seedPhrase: string;
  private network: EVMNetworkKey;

  constructor(seedPhrase: string, network: EVMNetworkKey = "sepolia") {
    this.seedPhrase = seedPhrase;
    this.network = network;
  }

  private getNetworkConfig() {
    return NETWORKS[this.network];
  }

  private ensureWalletManager() {
    if (!this.walletManager) {
      const config = this.getNetworkConfig();
      this.walletManager = new WalletManagerEvm(this.seedPhrase, {
        provider: config.rpc,
        transferMaxFee: 100000000000000n, // 0.0001 ETH max fee
      });
    }
    return this.walletManager;
  }

  async getAccount(index: number = 0) {
    const manager = this.ensureWalletManager();
    return await manager.getAccount(index);
  }

  async getAddress(index: number = 0): Promise<string> {
    const account = await this.getAccount(index);
    return await account.getAddress();
  }

  async getBalance(index: number = 0): Promise<string> {
    try {
      const account = await this.getAccount(index);
      const balanceWei = await account.getBalance();
      const balanceEth = (Number(balanceWei) / 1e18).toFixed(6);
      return balanceEth;
    } catch (error) {
      console.error("Error fetching EVM balance:", error);
      return "0";
    }
  }

  async getTokenBalance(
    tokenAddress: string,
    index: number = 0
  ): Promise<string> {
    try {
      const account = await this.getAccount(index);
      const balance = await account.getTokenBalance(tokenAddress);
      return balance.toString();
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return "0";
    }
  }

  async sendTransaction(
    to: string,
    valueInEth: string,
    index: number = 0
  ): Promise<TransactionResult> {
    const account = await this.getAccount(index);
    const valueInWei = BigInt(Math.floor(parseFloat(valueInEth) * 1e18));

    console.log(`📤 Sending ${valueInEth} ETH to ${to} on ${this.network}`);

    const result = await account.sendTransaction({
      to,
      value: valueInWei,
    });

    console.log("✅ Transaction successful:", result.hash);

    return {
      hash: result.hash,
      fee: result.fee,
      from: await account.getAddress(),
      to,
      value: valueInWei,
      network: this.network,
    };
  }

  async transferToken(
    tokenAddress: string,
    recipient: string,
    amount: bigint,
    index: number = 0
  ): Promise<TransferResult> {
    const account = await this.getAccount(index);

    console.log(`📤 Transferring token to ${recipient} on ${this.network}`);

    const result = await account.transfer({
      token: tokenAddress,
      recipient,
      amount,
    });

    console.log("✅ Transfer successful:", result.hash);

    return {
      hash: result.hash,
      fee: result.fee,
    };
  }

  async quoteTransfer(
    tokenAddress: string,
    recipient: string,
    amount: bigint,
    index: number = 0
  ): Promise<QuoteResult> {
    const account = await this.getAccount(index);

    const quote = await account.quoteTransfer({
      token: tokenAddress,
      recipient,
      amount,
    });

    return {
      fee: quote.fee,
    };
  }

  async quoteSendTransaction(
    to: string,
    valueInEth: string,
    index: number = 0
  ): Promise<QuoteResult> {
    const account = await this.getAccount(index);
    const valueInWei = BigInt(Math.floor(parseFloat(valueInEth) * 1e18));

    const quote = await account.quoteSendTransaction({
      to,
      value: valueInWei,
    });

    return {
      fee: quote.fee,
    };
  }

  async getFeeRates() {
    const manager = this.ensureWalletManager();
    return await manager.getFeeRates();
  }

  setNetwork(network: EVMNetworkKey) {
    this.network = network;
    this.dispose();
  }

  dispose() {
    if (this.walletManager) {
      this.walletManager.dispose();
      this.walletManager = null;
    }
  }

  getNetworkInfo() {
    return this.getNetworkConfig();
  }
}

// Solana Wallet Service
export class SolanaWalletService {
  private walletManager: WalletManagerSolana | null = null;
  private seedPhrase: string;
  private network: SolanaNetworkKey;

  constructor(seedPhrase: string, network: SolanaNetworkKey = "solana-devnet") {
    this.seedPhrase = seedPhrase;
    this.network = network;
  }

  private getNetworkConfig() {
    return NETWORKS[this.network];
  }

  private ensureWalletManager() {
    if (!this.walletManager) {
      const config = this.getNetworkConfig();
      this.walletManager = new WalletManagerSolana(this.seedPhrase, {
        rpcUrl: config.rpc,
        commitment: "confirmed",
        transferMaxFee: 10000000, // 0.01 SOL max fee
      });
    }
    return this.walletManager;
  }

  async getAccount(index: number = 0) {
    const manager = this.ensureWalletManager();
    return await manager.getAccount(index);
  }

  async getAddress(index: number = 0): Promise<string> {
    const account = await this.getAccount(index);
    return await account.getAddress();
  }

  async getBalance(index: number = 0): Promise<string> {
    try {
      const account = await this.getAccount(index);
      const balanceLamports = await account.getBalance();
      // 1 SOL = 1,000,000,000 lamports
      const balanceSol = (Number(balanceLamports) / 1e9).toFixed(9);
      return balanceSol;
    } catch (error) {
      console.error("Error fetching Solana balance:", error);
      return "0";
    }
  }

  async getTokenBalance(
    tokenMintAddress: string,
    index: number = 0
  ): Promise<string> {
    try {
      const account = await this.getAccount(index);
      const balance = await account.getTokenBalance(tokenMintAddress);
      return balance.toString();
    } catch (error) {
      console.error("Error fetching SPL token balance:", error);
      return "0";
    }
  }

  async sendTransaction(
    to: string,
    valueInSol: string,
    index: number = 0
  ): Promise<TransactionResult> {
    const account = await this.getAccount(index);
    // Convert SOL to lamports (1 SOL = 1e9 lamports)
    const valueInLamports = BigInt(Math.floor(parseFloat(valueInSol) * 1e9));

    console.log(`📤 Sending ${valueInSol} SOL to ${to} on ${this.network}`);

    const result = await account.sendTransaction({
      to,
      value: valueInLamports,
    });

    console.log("✅ Transaction successful:", result.hash);

    return {
      hash: result.hash,
      fee: result.fee,
      from: await account.getAddress(),
      to,
      value: valueInLamports,
      network: this.network,
    };
  }

  async transferToken(
    tokenMintAddress: string,
    recipient: string,
    amount: bigint,
    index: number = 0
  ): Promise<TransferResult> {
    const account = await this.getAccount(index);

    console.log(`📤 Transferring SPL token to ${recipient} on ${this.network}`);

    const result = await account.transfer({
      token: tokenMintAddress,
      recipient,
      amount,
    });

    console.log("✅ Transfer successful:", result.hash);

    return {
      hash: result.hash,
      fee: result.fee,
    };
  }

  async quoteTransfer(
    tokenMintAddress: string,
    recipient: string,
    amount: bigint,
    index: number = 0
  ): Promise<QuoteResult> {
    const account = await this.getAccount(index);

    const quote = await account.quoteTransfer({
      token: tokenMintAddress,
      recipient,
      amount,
    });

    return {
      fee: quote.fee,
    };
  }

  async quoteSendTransaction(
    to: string,
    valueInSol: string,
    index: number = 0
  ): Promise<QuoteResult> {
    const account = await this.getAccount(index);
    const valueInLamports = BigInt(Math.floor(parseFloat(valueInSol) * 1e9));

    const quote = await account.quoteSendTransaction({
      to,
      value: valueInLamports,
    });

    return {
      fee: quote.fee,
    };
  }

  async getFeeRates() {
    const manager = this.ensureWalletManager();
    return await manager.getFeeRates();
  }

  setNetwork(network: SolanaNetworkKey) {
    this.network = network;
    this.dispose();
  }

  dispose() {
    if (this.walletManager) {
      this.walletManager.dispose();
      this.walletManager = null;
    }
  }

  getNetworkInfo() {
    return this.getNetworkConfig();
  }
}

// Multi-chain Wallet Manager
export class MultiChainWalletService {
  private evmService: EVMWalletService | null = null;
  private solanaService: SolanaWalletService | null = null;
  private seedPhrase: string;

  constructor(seedPhrase: string) {
    this.seedPhrase = seedPhrase;
  }

  getEVMService(network: EVMNetworkKey = "sepolia"): EVMWalletService {
    if (!this.evmService) {
      this.evmService = new EVMWalletService(this.seedPhrase, network);
    }
    return this.evmService;
  }

  getSolanaService(
    network: SolanaNetworkKey = "solana-devnet"
  ): SolanaWalletService {
    if (!this.solanaService) {
      this.solanaService = new SolanaWalletService(this.seedPhrase, network);
    }
    return this.solanaService;
  }

  async getAllBalances(): Promise<{
    ethereum: string;
    solana: string;
  }> {
    const [ethBalance, solBalance] = await Promise.all([
      this.getEVMService().getBalance(),
      this.getSolanaService().getBalance(),
    ]);

    return {
      ethereum: ethBalance,
      solana: solBalance,
    };
  }

  async getAllAddresses(): Promise<{
    ethereum: string;
    solana: string;
  }> {
    const [ethAddress, solAddress] = await Promise.all([
      this.getEVMService().getAddress(),
      this.getSolanaService().getAddress(),
    ]);

    return {
      ethereum: ethAddress,
      solana: solAddress,
    };
  }

  dispose() {
    this.evmService?.dispose();
    this.solanaService?.dispose();
    this.evmService = null;
    this.solanaService = null;
  }
}

// Helper functions
export function formatBalance(balance: string, decimals: number = 6): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0";
  return num.toFixed(decimals);
}

export function parseAmount(amount: string, decimals: number): bigint {
  const multiplier = Math.pow(10, decimals);
  return BigInt(Math.floor(parseFloat(amount) * multiplier));
}

export function formatAmount(amount: bigint, decimals: number): string {
  const divisor = Math.pow(10, decimals);
  return (Number(amount) / divisor).toFixed(decimals);
}

export function isValidEVMAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
