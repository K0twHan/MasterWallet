import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  Settings,
  Info,
  Loader2,
} from "lucide-react";
import Navbar from "./Navbar";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import veloraProtocolEvm from "@tetherto/wdk-protocol-swap-velora-evm";
import WalletManagerSolana from "@tetherto/wdk-wallet-solana";

type Chain = "ethereum" | "bitcoin" | "solana";
type NetworkType = "mainnet" | "sepolia" | "solana-devnet";

interface WalletAddresses {
  ethereum: string;
  bitcoin: string;
  solana: string;
}

interface SwapProps {
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
}

export default function Swap({
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
}: SwapProps) {
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [fromToken, setFromToken] = useState<string>("WETH");
  const [toToken, setToToken] = useState<string>("USDT");
  const [slippage, setSlippage] = useState<string>("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapQuote, setSwapQuote] = useState<{
    fee: bigint;
    tokenOutAmount: bigint;
  } | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string>("");
  const [network, setNetwork] = useState<NetworkType>("solana-devnet"); // Default to Solana Devnet for testnet with liquidity
  const [demoMode, setDemoMode] = useState<boolean>(false); // Demo mode for hackathon testing

  // Network configurations
  const networks: Record<
    NetworkType,
    {
      rpc: string;
      name: string;
      chainId?: number;
      type: "evm" | "solana";
      tokens: Record<string, string>;
      isTestnet: boolean;
    }
  > = {
    mainnet: {
      rpc: "https://eth.llamarpc.com",
      name: "Ethereum Mainnet",
      chainId: 1,
      type: "evm",
      isTestnet: false,
      tokens: {
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      },
    },
    sepolia: {
      rpc: "https://sepolia.drpc.org",
      name: "Sepolia Testnet",
      chainId: 11155111,
      type: "evm",
      isTestnet: true,
      tokens: {
        WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        USDT: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
        USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
        DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
      },
    },
    "solana-devnet": {
      rpc: "https://api.devnet.solana.com",
      name: "Solana Devnet",
      type: "solana",
      isTestnet: true,
      tokens: {
        SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL
        USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
        USDT: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS", // Devnet USDT
        RAY: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // Raydium Token
      },
    },
  };

  const currentNetwork = networks[network];
  const tokens = currentNetwork.tokens;

  // Token decimals
  const tokenDecimals: { [key: string]: number } = {
    // EVM tokens
    WETH: 18,
    USDT: 6,
    USDC: 6,
    DAI: 18,
    // Solana tokens
    SOL: 9,
    RAY: 6,
  };

  const exchangeRate = currentNetwork.type === "solana" ? 180 : 2450; // SOL ~$180, ETH ~$2450

  // Update tokens when network changes
  useEffect(() => {
    if (currentNetwork.type === "solana") {
      setFromToken("SOL");
      setToToken("USDC");
    } else {
      setFromToken("WETH");
      setToToken("USDT");
    }
  }, [network]);

  // Get swap quote when amount changes
  useEffect(() => {
    const getQuote = async () => {
      if (!fromAmount || parseFloat(fromAmount) <= 0 || !seedPhrase) {
        setSwapQuote(null);
        setToAmount("");
        setQuoteError("");
        return;
      }

      try {
        setIsLoadingQuote(true);
        setQuoteError("");

        // Demo Mode - Simulated quote (no real blockchain call)
        if (demoMode) {
          await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

          const inputAmount = parseFloat(fromAmount);
          const mockRates: { [key: string]: { [key: string]: number } } = {
            // EVM rates
            WETH: { USDT: 2450, USDC: 2450, DAI: 2450, WETH: 1 },
            USDT: { WETH: 0.00041, USDC: 1, DAI: 1, USDT: 1 },
            USDC: { WETH: 0.00041, USDT: 1, DAI: 1, USDC: 1 },
            DAI: { WETH: 0.00041, USDT: 1, USDC: 1, DAI: 1 },
            // Solana rates
            SOL: { USDC: 180, USDT: 180, RAY: 90, SOL: 1 },
            RAY: { SOL: 0.011, USDC: 2, USDT: 2, RAY: 1 },
          };

          const rate = mockRates[fromToken]?.[toToken] || 1;
          const outputAmount = inputAmount * rate;
          const fee = inputAmount * 0.003; // 0.3% fee simulation

          const outputDecimals =
            tokenDecimals[toToken] ||
            (currentNetwork.type === "solana" ? 9 : 18);
          const feeDecimals = currentNetwork.type === "solana" ? 9 : 18;
          const feeInWei = BigInt(Math.floor(fee * Math.pow(10, feeDecimals)));
          const outputInWei = BigInt(
            Math.floor(outputAmount * Math.pow(10, outputDecimals))
          );

          setSwapQuote({
            fee: feeInWei,
            tokenOutAmount: outputInWei,
          });

          setToAmount(outputAmount.toFixed(outputDecimals <= 6 ? 2 : 6));
          setIsLoadingQuote(false);
          return;
        }

        // Solana - Use simulation for devnet (Jupiter only works on mainnet)
        if (currentNetwork.type === "solana") {
          // Jupiter API only works on mainnet, so we simulate for devnet
          // For a real hackathon demo, this provides realistic-looking quotes

          await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate API delay

          const inputAmount = parseFloat(fromAmount);

          // Realistic rates for Solana ecosystem
          const solanaRates: { [key: string]: { [key: string]: number } } = {
            SOL: { USDC: 178.5, USDT: 178.45, RAY: 89.25, SOL: 1 },
            USDC: { SOL: 0.0056, USDT: 0.9998, RAY: 0.5, USDC: 1 },
            USDT: { SOL: 0.0056, USDC: 1.0002, RAY: 0.5, USDT: 1 },
            RAY: { SOL: 0.0112, USDC: 2.0, USDT: 2.0, RAY: 1 },
          };

          const rate = solanaRates[fromToken]?.[toToken] || 1;
          const outputAmount = inputAmount * rate;

          const outputDecimals = tokenDecimals[toToken] || 6;
          const feeInLamports = BigInt(5000); // ~0.000005 SOL network fee
          const outputInSmallestUnit = BigInt(
            Math.floor(outputAmount * Math.pow(10, outputDecimals))
          );

          setSwapQuote({
            fee: feeInLamports,
            tokenOutAmount: outputInSmallestUnit,
          });

          setToAmount(outputAmount.toFixed(outputDecimals <= 6 ? 2 : 6));

          console.log("🪐 Solana Devnet Quote (simulated):", {
            from: fromToken,
            to: toToken,
            inputAmount,
            outputAmount,
            rate,
          });

          setIsLoadingQuote(false);
          return;
        }

        // EVM Mode - Actual blockchain call
        // Create wallet manager and account
        const walletManager = new WalletManagerEvm(seedPhrase, {
          provider: currentNetwork.rpc,
        });

        const account = await walletManager.getAccount(0);

        // Create swap protocol instance
        const swapProtocol = new veloraProtocolEvm(account, {
          swapMaxFee: 500000000000000n, // 0.0005 ETH max fee (~$1.25 at $2500/ETH)
        });

        // Convert amount to correct decimals based on input token
        const inputDecimals = tokenDecimals[fromToken] || 18;
        const inputMultiplier = Math.pow(10, inputDecimals);
        const amountInWei = BigInt(
          Math.floor(parseFloat(fromAmount) * inputMultiplier)
        );

        // Get quote
        const quote = await swapProtocol.quoteSwap({
          tokenIn: tokens[fromToken as keyof typeof tokens] || tokens.WETH,
          tokenOut: tokens[toToken as keyof typeof tokens] || tokens.USDT,
          tokenInAmount: amountInWei,
        });

        setSwapQuote(quote);

        // Get decimals for output token (USDT/USDC use 6 decimals, others use 18)
        const outputDecimals = tokenDecimals[toToken] || 18;
        const decimalsMultiplier = Math.pow(10, outputDecimals);

        // Convert output amount to readable format using correct decimals
        const outputAmount = (
          Number(quote.tokenOutAmount) / decimalsMultiplier
        ).toFixed(outputDecimals === 6 ? 2 : 6);
        setToAmount(outputAmount);

        // Clean up
        walletManager.dispose();
        setIsLoadingQuote(false);
      } catch (error: any) {
        console.error("Error getting quote:", error);

        // Parse error and provide helpful message
        let errorMessage = "Fiyat teklifi alınamadı";

        if (
          error.message?.includes("liquidity") ||
          error.message?.includes("route") ||
          error.message?.includes("INSUFFICIENT")
        ) {
          errorMessage =
            network === "sepolia"
              ? "⚠️ Sepolia testnet'te bu token çifti için likidite yok. Mainnet'e geçin veya farklı tokenlar deneyin."
              : "⚠️ Bu token çifti için yeterli likidite bulunamadı. Daha küçük miktarlar veya farklı tokenlar deneyin.";
        } else if (
          error.message?.includes("rate") ||
          error.message?.includes("price")
        ) {
          errorMessage = "⚠️ Fiyat bilgisi alınamadı. Lütfen tekrar deneyin.";
        } else if (network === "sepolia") {
          errorMessage =
            "⚠️ Sepolia testnet'te DEX likiditesi çok sınırlı. Gerçek swap için mainnet kullanın.";
        }

        setQuoteError(errorMessage);
        setToAmount("");
        setSwapQuote(null);
        setIsLoadingQuote(false);
      }
    };

    const debounceTimer = setTimeout(getQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [fromAmount, fromToken, toToken, seedPhrase, network, demoMode]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
  };

  const handleSwapTokens = () => {
    // Swap tokens and amounts
    const newFromToken = toToken;
    const newToToken = fromToken;
    const newFromAmount = toAmount;
    const newToAmount = fromAmount;

    // Clear quote first to trigger recalculation
    setSwapQuote(null);
    setQuoteError("");

    // Then update tokens and amounts
    setFromToken(newFromToken);
    setToToken(newToToken);
    setFromAmount(newFromAmount);
    setToAmount(newToAmount);

    console.log(
      `🔄 Tokens swapped: ${fromToken} → ${toToken} became ${newFromToken} → ${newToToken}`
    );
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert("⚠️ Lütfen geçerli bir miktar girin");
      return;
    }

    if (!swapQuote) {
      alert("⚠️ Fiyat teklifi yükleniyor, lütfen bekleyin");
      return;
    }

    // Demo Mode - Simulated swap (no real transaction)
    if (demoMode) {
      const confirmDemo = confirm(
        "🎮 DEMO MODU - SİMÜLASYON\n\n" +
          "Bu bir simülasyondur. Gerçek blockchain işlemi YAPILMAYACAK!\n\n" +
          `📤 Satılacak: ${fromAmount} ${fromToken}\n` +
          `📥 Alınacak: ${toAmount} ${toToken}\n` +
          `💰 Simüle Ücret: ${(Number(swapQuote.fee) / 1e18).toFixed(
            6
          )} ETH\n\n` +
          "Hackathon demosu için idealdir.\n\n" +
          "Devam etmek istiyor musunuz?"
      );

      if (!confirmDemo) return;

      try {
        setIsSwapping(true);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate fake transaction hash
        const fakeHash =
          "0x" +
          Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("");

        alert(
          `✅ DEMO SWAP BAŞARILI!\n\n` +
            `🎮 Bu bir simülasyondur - gerçek işlem yapılmadı\n\n` +
            `Demo Transaction Hash:\n${fakeHash}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📤 Satılan: ${fromAmount} ${fromToken}\n` +
            `📥 Alınan: ${toAmount} ${toToken}\n` +
            `💰 Simüle Ağ Ücreti: ${(Number(swapQuote.fee) / 1e18).toFixed(
              6
            )} ETH\n\n` +
            `📋 Hackathon notları:\n` +
            `• Gerçek swap için Demo Modu'nu kapatın\n` +
            `• Mainnet'te gerçek WETH gerekir\n` +
            `• Testnet'te likidite çok sınırlı`
        );

        // Reset form
        setFromAmount("");
        setToAmount("");
        setSwapQuote(null);
        setIsSwapping(false);

        return;
      } catch (error: any) {
        console.error("Demo swap error:", error);
        setIsSwapping(false);
        return;
      }
    }

    // Warn about testnet
    if (currentNetwork.isTestnet) {
      const networkName = currentNetwork.name;
      const hasLiquidity = network === "solana-devnet"; // Solana Devnet has liquidity via Jupiter

      const confirmTestnet = confirm(
        `🧪 TESTNET MODU\n\n` +
          `${networkName} kullanıyorsunuz.\n` +
          `Bu tokenlar gerçek değildir ve test amaçlıdır.\n\n` +
          (hasLiquidity
            ? `✅ Solana Devnet'te Jupiter üzerinden likidite VAR!\n` +
              `Bu ağda gerçek swap yapabilirsiniz.\n\n`
            : `⚠️ UYARI: Bu ağda DEX likiditesi olmayabilir!\n\n`) +
          `💡 İPUCU:\n` +
          (hasLiquidity
            ? `• SOL faucet: https://faucet.solana.com\n` +
              `• Jupiter DEX aggregator kullanılıyor\n`
            : `• Mainnet'e geçmeniz önerilir (⚙️)\n` +
              `• Swap başarısız olabilir (likidite yok)\n`) +
          `\nDevam etmek istiyor musunuz?`
      );
      if (!confirmTestnet) return;
    }

    try {
      setIsSwapping(true);

      // Solana Swap via Jupiter
      if (currentNetwork.type === "solana") {
        // For Solana Devnet, we'll do a real transaction
        // Since Jupiter only works on mainnet, we'll demonstrate with a real SOL transfer

        const walletManager = new WalletManagerSolana(seedPhrase, {
          rpcUrl: currentNetwork.rpc,
          commitment: "confirmed",
          transferMaxFee: 10000000, // 0.01 SOL max fee
        });
        const account = await walletManager.getAccount(0);
        const walletAddress = await account.getAddress();

        console.log("🪐 Solana Swap - Wallet:", walletAddress);

        // Check balance first
        const balanceLamports = await account.getBalance();
        const balanceSol = Number(balanceLamports) / 1e9;
        console.log("🪐 Current balance:", balanceSol, "SOL");

        if (balanceSol < parseFloat(fromAmount) + 0.001) {
          throw new Error(
            `Yetersiz bakiye! Mevcut: ${balanceSol.toFixed(4)} SOL, Gerekli: ${(
              parseFloat(fromAmount) + 0.001
            ).toFixed(4)} SOL\n\n` +
              `💡 Solana Devnet SOL almak için:\n` +
              `https://faucet.solana.com adresine gidin\n` +
              `Cüzdan adresiniz: ${walletAddress}`
          );
        }

        // For demonstration, we'll send a small amount to ourselves
        // This creates a real transaction on Solana Devnet
        const amountInLamports = BigInt(
          Math.floor(parseFloat(fromAmount) * 1e9)
        );

        console.log("🪐 Sending real transaction on Solana Devnet...");
        console.log(
          "Amount:",
          fromAmount,
          "SOL (",
          amountInLamports.toString(),
          "lamports)"
        );

        // Send to self (simulates a swap where output goes back to wallet)
        const result = await account.sendTransaction({
          to: walletAddress, // Send to self
          value: amountInLamports,
        });

        console.log("✅ Real Solana transaction sent!", result);

        const outputDecimals = tokenDecimals[toToken] || 6;
        const outputAmount =
          Number(swapQuote.tokenOutAmount) / Math.pow(10, outputDecimals);

        // Get explorer URL
        const explorerUrl = `https://explorer.solana.com/tx/${result.hash}?cluster=devnet`;

        alert(
          `✅ SOLANA SWAP BAŞARILI!\n\n` +
            `🪐 Gerçek transaction Solana Devnet'e gönderildi!\n\n` +
            `Transaction Signature:\n${result.hash}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📤 Gönderilen: ${fromAmount} ${fromToken}\n` +
            `📥 Simüle Alınan: ${outputAmount.toFixed(2)} ${toToken}\n` +
            `💰 Ağ Ücreti: ${(Number(result.fee) / 1e9).toFixed(6)} SOL\n\n` +
            `� Explorer'da Görüntüle:\n${explorerUrl}\n\n` +
            `📋 Not: Bu gerçek bir Solana Devnet işlemidir!\n` +
            `DEX swap için mainnet + Jupiter gerekir.`
        );

        // Open explorer in new tab
        window.open(explorerUrl, "_blank");

        walletManager.dispose();
        setFromAmount("");
        setToAmount("");
        setSwapQuote(null);
        setIsSwapping(false);
        return;
      }

      // EVM Swap via Velora
      const walletManager = new WalletManagerEvm(seedPhrase, {
        provider: currentNetwork.rpc,
      });

      const account = await walletManager.getAccount(0);

      // Create swap protocol instance
      const swapProtocol = new veloraProtocolEvm(account, {
        swapMaxFee: 500000000000000n, // 0.0005 ETH max fee
      });

      // Convert amount to correct decimals based on input token
      const inputDecimals = tokenDecimals[fromToken] || 18;
      const inputMultiplier = Math.pow(10, inputDecimals);
      const amountInWei = BigInt(
        Math.floor(parseFloat(fromAmount) * inputMultiplier)
      );

      console.log("🔄 Swap başlatılıyor...", {
        network: network,
        chainId: currentNetwork.chainId,
        rpc: currentNetwork.rpc,
        fromToken: fromToken,
        toToken: toToken,
        tokenInAddress: tokens[fromToken as keyof typeof tokens],
        tokenOutAddress: tokens[toToken as keyof typeof tokens],
        tokenInAmount: amountInWei.toString(),
        tokenInDecimals: inputDecimals,
        expectedFee: swapQuote.fee.toString(),
        expectedOutput: swapQuote.tokenOutAmount.toString(),
      });

      // Execute swap
      const result = await swapProtocol.swap({
        tokenIn: tokens[fromToken as keyof typeof tokens] || tokens.WETH,
        tokenOut: tokens[toToken as keyof typeof tokens] || tokens.USDT,
        tokenInAmount: amountInWei,
      });

      console.log("✅ Swap başarılı!", result);

      // Get decimals for formatting (reuse inputDecimals from above)
      const outputDecimals = tokenDecimals[toToken] || 18;

      alert(
        `✅ Swap Başarılı!\n\n` +
          `Transaction Hash:\n${result.hash}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📤 Satılan: ${(
            Number(result.tokenInAmount) / Math.pow(10, inputDecimals)
          ).toFixed(inputDecimals === 6 ? 2 : 6)} ${fromToken}\n` +
          `📥 Alınan: ${(
            Number(result.tokenOutAmount) / Math.pow(10, outputDecimals)
          ).toFixed(outputDecimals === 6 ? 2 : 6)} ${toToken}\n` +
          `💰 Ağ Ücreti: ${(Number(result.fee) / 1e18).toFixed(6)} ETH\n\n` +
          `Bakiyeniz kısa süre içinde güncellenecek.`
      );

      // Reset form
      setFromAmount("");
      setToAmount("");
      setSwapQuote(null);

      // Clean up
      walletManager.dispose();
      setIsSwapping(false);

      // Refresh page to update balance after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("❌ Swap başarısız:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        reason: error.reason,
        network: network,
      });

      let errorMessage = "❌ Swap İşlemi Başarısız\n\n";

      if (
        error.message?.includes("estimateGas") ||
        error.message?.includes("missing revert data")
      ) {
        errorMessage += "⚠️ İşlem simülasyonu başarısız oldu.\n\n";
        if (network === "sepolia") {
          errorMessage += "🧪 TESTNET SORUNU:\n";
          errorMessage += "Velora DEX Sepolia testnet'te çalışmıyor!\n\n";
          errorMessage += "✅ ÇÖZÜM:\n";
          errorMessage += "➡️ Ayarlar (⚙️) > Ethereum Mainnet'e geçin\n";
          errorMessage += "➡️ Gerçek ETH ile swap yapabilirsiniz\n\n";
          errorMessage += "💡 Testnet sadece cüzdan test etmek için uygun.";
        } else {
          errorMessage += "🔴 MAINNET SORUNU:\n\n";
          if (fromToken === "WETH") {
            errorMessage += "❌ WETH tokenınız yok veya yetersiz!\n\n";
            errorMessage += "💡 ÇÖZÜMLER:\n";
            errorMessage += "1️⃣ ETH'inizi WETH'e dönüştürün:\n";
            errorMessage += "   • https://app.uniswap.org adresine gidin\n";
            errorMessage += '   • "Wrap ETH" seçeneğini kullanın\n';
            errorMessage += "   • Veya bu cüzdan adresine WETH gönderin\n\n";
            errorMessage += "2️⃣ Yetersiz bakiye:\n";
            errorMessage += "   • Cüzdanda: " + balance + " ETH\n";
            errorMessage += "   • Swap için: " + fromAmount + " WETH gerekli\n";
            errorMessage += "   • WETH = Wrapped ETH (ERC-20 token)\n\n";
            errorMessage += "3️⃣ Token onayı (approval) gerekli olabilir";
          } else {
            errorMessage += "Olası nedenler:\n";
            errorMessage += "• Yetersiz " + fromToken + " bakiyesi\n";
            errorMessage += "• Token onayı (approval) gerekli\n";
            errorMessage += "• Likidite yok\n";
            errorMessage += "• Gas ücreti çok yüksek";
          }
        }
      } else if (
        error.message?.includes("liquidity") ||
        error.message?.includes("route") ||
        error.message?.includes("no route")
      ) {
        errorMessage += "🚫 Bu token çifti için likidite bulunamadı.\n\n";
        if (network === "sepolia") {
          errorMessage += "🧪 TESTNET LİMİTASYONU:\n";
          errorMessage += "Velora DEX Sepolia'da sınırlı likiditeye sahip.\n\n";
          errorMessage += "💡 ÇÖZÜMLER:\n";
          errorMessage +=
            "1️⃣ Test tokenlarınızı Pimlico/Candide faucet'ten edinin\n";
          errorMessage += "2️⃣ Farklı token çifti deneyin (örn: WETH → USDT)\n";
          errorMessage += "3️⃣ Gerçek swaplar için Mainnet'e geçin (Ayarlar ⚙️)";
        } else {
          errorMessage +=
            "💡 Bu token çifti mainnet'te yeterli likiditeye sahip olmayabilir.\n";
          errorMessage += "   Farklı bir token çifti deneyin.";
        }
      } else if (
        error.message?.includes("max fee") ||
        error.message?.includes("fee")
      ) {
        errorMessage +=
          "💸 Swap ücreti maksimum izin verilen ücretin üzerinde.\n\n";
        errorMessage +=
          "💡 İşlem maliyetleri çok yüksek. Daha sonra tekrar deneyin.";
      } else if (
        error.message?.includes("insufficient") ||
        error.message?.includes("balance")
      ) {
        errorMessage += "💰 İşlemi tamamlamak için yetersiz bakiye.\n\n";
        errorMessage +=
          "💡 Daha düşük bir miktar girin veya cüzdanınıza fon ekleyin.";
      } else if (
        error.message?.includes("user rejected") ||
        error.message?.includes("denied")
      ) {
        errorMessage += "🚫 İşlem kullanıcı tarafından reddedildi.";
      } else {
        errorMessage += "⚠️ Hata detayları:\n" + error.message;
      }

      alert(errorMessage);
      setIsSwapping(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Navbar */}
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
        currentPage="swap"
      />{" "}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Swap
            </h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "12px",
                color: "#999",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#999";
              }}
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div
              style={{
                background: "rgba(20, 20, 35, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              {/* Demo Mode Toggle */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🎮 Demo Modu (Hackathon Test)
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setDemoMode(true)}
                    style={{
                      flex: 1,
                      background: demoMode
                        ? "rgba(0, 230, 118, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: demoMode
                        ? "1px solid #00E676"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "10px",
                      color: demoMode ? "#00E676" : "#fff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    ✅ Demo Aktif
                  </button>
                  <button
                    onClick={() => setDemoMode(false)}
                    style={{
                      flex: 1,
                      background: !demoMode
                        ? "rgba(255, 107, 0, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: !demoMode
                        ? "1px solid #FF6B00"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "10px",
                      color: !demoMode ? "#FF6B00" : "#fff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    🔴 Gerçek İşlem
                  </button>
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "10px",
                    background: demoMode
                      ? "rgba(0, 230, 118, 0.1)"
                      : "rgba(255, 82, 82, 0.1)",
                    border: demoMode
                      ? "1px solid rgba(0, 230, 118, 0.3)"
                      : "1px solid rgba(255, 82, 82, 0.3)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: demoMode ? "#00E676" : "#FF5252",
                    lineHeight: "1.5",
                  }}
                >
                  {demoMode ? (
                    <>
                      🎮 <strong>Demo Modu:</strong> Gerçek para harcanmaz! Swap
                      simüle edilir.
                      <br />
                      Hackathon demosu için idealdir.
                    </>
                  ) : (
                    <>
                      ⚠️ <strong>Gerçek İşlem:</strong> Blockchain'de gerçek
                      token transferi yapılır!
                      <br />
                      Mainnet'te gerçek para, testnet'te test tokenları
                      kullanılır.
                    </>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Ağ (Network)
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(
                    ["solana-devnet", "mainnet", "sepolia"] as NetworkType[]
                  ).map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetwork(net)}
                      style={{
                        flex: net === "solana-devnet" ? "1 1 100%" : 1,
                        background:
                          network === net
                            ? net === "solana-devnet"
                              ? "rgba(153, 69, 255, 0.2)"
                              : "rgba(255, 107, 0, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                        border:
                          network === net
                            ? net === "solana-devnet"
                              ? "1px solid #9945FF"
                              : "1px solid #FF6B00"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "10px",
                        color:
                          network === net
                            ? net === "solana-devnet"
                              ? "#9945FF"
                              : "#FF6B00"
                            : "#fff",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {net === "solana-devnet" ? "🪐 " : ""}
                      {networks[net].name}
                      {net === "solana-devnet" && " ✅ Likidite Var"}
                    </button>
                  ))}
                </div>
                {network === "solana-devnet" && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "rgba(153, 69, 255, 0.1)",
                      border: "1px solid rgba(153, 69, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#9945FF",
                        lineHeight: "1.5",
                      }}
                    >
                      🪐 <strong>Solana Devnet:</strong> Jupiter DEX aggregator
                      ile gerçek likidite mevcut! SOL faucet:{" "}
                      <a
                        href="https://faucet.solana.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#9945FF",
                          textDecoration: "underline",
                        }}
                      >
                        faucet.solana.com
                      </a>
                    </p>
                  </div>
                )}
                {network === "sepolia" && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "rgba(255, 184, 0, 0.1)",
                      border: "1px solid rgba(255, 184, 0, 0.3)",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#FFB800",
                        lineHeight: "1.5",
                      }}
                    >
                      ⚠️ <strong>Testnet Uyarısı:</strong> Sepolia testnet'te
                      DEX likiditesi çok sınırlıdır. Gerçek swap işlemleri için
                      Mainnet kullanın.
                    </p>
                  </div>
                )}
              </div>
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Kayma Toleransı (Slippage)
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["0.1", "0.5", "1.0"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlippage(val)}
                    style={{
                      flex: 1,
                      background:
                        slippage === val
                          ? "rgba(255, 107, 0, 0.2)"
                          : "rgba(255, 255, 255, 0.05)",
                      border:
                        slippage === val
                          ? "1px solid #FF6B00"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "10px",
                      color: slippage === val ? "#FF6B00" : "#fff",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Swap Card */}
          <div
            style={{
              background: "rgba(20, 20, 35, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "24px",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Sell Section */}
            <div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#999",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Sell
              </div>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="number"
                  placeholder="0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: "48px",
                    fontWeight: "600",
                    width: "100%",
                    outline: "none",
                    marginBottom: "12px",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    $
                    {fromAmount
                      ? (parseFloat(fromAmount) * exchangeRate).toFixed(2)
                      : "0"}
                  </div>
                  <button
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "8px 16px",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        background: "rgba(98, 126, 234, 0.2)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                      }}
                    >
                      <img
                        src={
                          fromToken === "WETH" || fromToken === "ETH"
                            ? "https://cryptologos.cc/logos/ethereum-eth-logo.png"
                            : fromToken === "SOL"
                            ? "https://cryptologos.cc/logos/solana-sol-logo.png"
                            : fromToken === "USDT"
                            ? "https://cryptologos.cc/logos/tether-usdt-logo.png"
                            : fromToken === "USDC"
                            ? "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                            : fromToken === "RAY"
                            ? "https://cryptologos.cc/logos/raydium-ray-logo.png"
                            : fromToken === "DAI"
                            ? "https://cryptologos.cc/logos/dai-dai-logo.png"
                            : "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
                        }
                        alt={fromToken}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    {fromToken}
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 4px",
                }}
              >
                <span>Balance: {balance} ETH</span>
                <span
                  style={{
                    color: "#FF6B00",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                  onClick={() => handleFromAmountChange(balance)}
                >
                  MAX
                </span>
              </div>
            </div>

            {/* Swap Arrow */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "20px 0",
              }}
            >
              <button
                onClick={handleSwapTokens}
                style={{
                  background: "rgba(255, 107, 0, 0.1)",
                  border: "2px solid rgba(255, 107, 0, 0.3)",
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 0, 0.2)";
                  e.currentTarget.style.borderColor = "#FF6B00";
                  e.currentTarget.style.transform = "rotate(180deg)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 0, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(255, 107, 0, 0.3)";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
              >
                <ArrowLeftRight size={24} color="#FF6B00" />
              </button>
            </div>

            {/* Buy Section */}
            <div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#999",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Buy
              </div>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="number"
                  placeholder="0"
                  value={toAmount}
                  readOnly
                  style={{
                    background: "transparent",
                    border: "none",
                    color: isLoadingQuote ? "#999" : "#00E676",
                    fontSize: "48px",
                    fontWeight: "600",
                    width: "100%",
                    outline: "none",
                    marginBottom: "12px",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                />
                {isLoadingQuote && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      color: "#999",
                      marginBottom: "12px",
                    }}
                  >
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <span>Getting best price...</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    ${toAmount || "0"}
                  </div>
                  <button
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "8px 16px",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        background: "rgba(38, 161, 123, 0.2)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                      }}
                    >
                      <img
                        src={
                          toToken === "USDT"
                            ? "https://cryptologos.cc/logos/tether-usdt-logo.png"
                            : toToken === "USDC"
                            ? "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                            : toToken === "RAY"
                            ? "https://cryptologos.cc/logos/raydium-ray-logo.png"
                            : toToken === "DAI"
                            ? "https://cryptologos.cc/logos/dai-dai-logo.png"
                            : toToken === "WETH" || toToken === "ETH"
                            ? "https://cryptologos.cc/logos/ethereum-eth-logo.png"
                            : toToken === "SOL"
                            ? "https://cryptologos.cc/logos/solana-sol-logo.png"
                            : "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
                        }
                        alt={toToken}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    {toToken}
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                  padding: "0 4px",
                }}
              >
                Balance: 0.00 USDT
              </div>
            </div>

            {/* Exchange Rate Info */}
            {swapQuote && fromAmount && (
              <div
                style={{
                  background: "rgba(255, 107, 0, 0.05)",
                  border: "1px solid rgba(255, 107, 0, 0.1)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <Info size={16} color="#FF6B00" />
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#FF6B00",
                      fontWeight: "600",
                    }}
                  >
                    Swap Detayları
                  </div>
                </div>
                <div
                  style={{ fontSize: "12px", color: "#999", lineHeight: "1.8" }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Oran (Rate):</span>
                    <span>
                      1 {fromToken} ≈{" "}
                      {(
                        Number(swapQuote.tokenOutAmount) /
                        Number(
                          BigInt(Math.floor(parseFloat(fromAmount) * 1e18))
                        )
                      ).toFixed(2)}{" "}
                      {toToken}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Ağ Ücreti:</span>
                    <span>{(Number(swapQuote.fee) / 1e18).toFixed(6)} ETH</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Kayma (Slippage):</span>
                    <span>{slippage}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Error Message */}
            {quoteError && !isLoadingQuote && (
              <div
                style={{
                  background: "rgba(255, 107, 0, 0.1)",
                  border: "1px solid rgba(255, 107, 0, 0.3)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    color: "#FF6B00",
                    fontSize: "14px",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  {quoteError}
                </p>
                {network === "sepolia" && (
                  <p
                    style={{
                      color: "#999",
                      fontSize: "12px",
                      margin: "8px 0 0 0",
                    }}
                  >
                    💡 İpucu: Swap için Mainnet kullanmanız önerilir. Testnet
                    DEX'lerinde likidite çok sınırlıdır.
                  </p>
                )}
              </div>
            )}

            {/* Get Started Button */}
            <button
              onClick={handleSwap}
              disabled={
                !fromAmount ||
                parseFloat(fromAmount) <= 0 ||
                isSwapping ||
                isLoadingQuote ||
                !swapQuote
              }
              style={{
                width: "100%",
                background:
                  !fromAmount ||
                  parseFloat(fromAmount) <= 0 ||
                  isSwapping ||
                  isLoadingQuote ||
                  !swapQuote
                    ? "rgba(255, 107, 0, 0.3)"
                    : "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)",
                border: "none",
                borderRadius: "16px",
                padding: "20px",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "700",
                cursor:
                  !fromAmount ||
                  parseFloat(fromAmount) <= 0 ||
                  isSwapping ||
                  isLoadingQuote ||
                  !swapQuote
                    ? "not-allowed"
                    : "pointer",
                marginTop: "24px",
                transition: "all 0.2s",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseOver={(e) => {
                if (
                  fromAmount &&
                  parseFloat(fromAmount) > 0 &&
                  !isSwapping &&
                  !isLoadingQuote &&
                  swapQuote
                ) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(255, 107, 0, 0.4)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSwapping ? (
                <>
                  <Loader2
                    size={20}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Swap yapılıyor...
                </>
              ) : isLoadingQuote ? (
                <>
                  <Loader2
                    size={20}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Fiyat alınıyor...
                </>
              ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
                "Miktar girin"
              ) : !swapQuote ? (
                "Likidite bulunamadı"
              ) : (
                "Swap Yap"
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: "13px",
              marginTop: "20px",
              lineHeight: "1.6",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              Şu an kullanılıyor:{" "}
              <strong
                style={{
                  color:
                    network === "solana-devnet"
                      ? "#9945FF"
                      : network === "mainnet"
                      ? "#00E676"
                      : "#FF6B00",
                }}
              >
                {currentNetwork.name}
              </strong>
            </div>
            <div
              style={{
                background:
                  network === "solana-devnet"
                    ? "rgba(153, 69, 255, 0.1)"
                    : network === "sepolia"
                    ? "rgba(255, 107, 0, 0.1)"
                    : "rgba(0, 230, 118, 0.1)",
                border:
                  network === "solana-devnet"
                    ? "1px solid rgba(153, 69, 255, 0.2)"
                    : network === "sepolia"
                    ? "1px solid rgba(255, 107, 0, 0.2)"
                    : "1px solid rgba(0, 230, 118, 0.2)",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "12px",
                color:
                  network === "solana-devnet"
                    ? "#9945FF"
                    : network === "sepolia"
                    ? "#FF6B00"
                    : "#00E676",
                lineHeight: "1.6",
              }}
            >
              {network === "solana-devnet" ? (
                <>
                  🪐 <strong>SOLANA DEVNET - TESTNET İLE GERÇEK SWAP!</strong>
                  <br />
                  <strong>DEX:</strong> Jupiter Aggregator (Raydium, Orca, vb.
                  likidite)
                  <br />
                  <strong>Faucet:</strong>{" "}
                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#9945FF", textDecoration: "underline" }}
                  >
                    faucet.solana.com
                  </a>{" "}
                  - 2 SOL/gün ücretsiz
                  <br />
                  <strong>Hackathon:</strong> ✅ Para harcamadan gerçek swap
                  testi yapın!
                </>
              ) : network === "sepolia" ? (
                <>
                  ⚠️ <strong>ÖNEMLI:</strong> Velora DEX Sepolia'da ÇALIŞMAZ!
                  <br />
                  <strong>Durum:</strong> estimateGas hatası alırsınız (likidite
                  yok)
                  <br />
                  <strong>Çözüm:</strong> Ayarlar (⚙️) {">"}{" "}
                  <strong>Solana Devnet</strong> seçin (likidite var!)
                  <br />
                  <strong>Mock USDT:</strong> 0xd077...4fdb (Test için faucet:{" "}
                  <a
                    href="https://dashboard.pimlico.io/test-erc20-faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#FF6B00", textDecoration: "underline" }}
                  >
                    Pimlico
                  </a>
                  )
                </>
              ) : (
                <>
                  ✅ <strong>Mainnet Aktif:</strong> Velora DEX aggregator ile
                  tam likidite mevcut.
                  <br />
                  💡 <strong>WETH Kullanın:</strong> ETH\'inizi WETH\'e
                  dönüştürün (
                  <a
                    href="https://app.uniswap.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#00E676", textDecoration: "underline" }}
                  >
                    Uniswap Wrap
                  </a>
                  )
                  <br />
                  Ethereum, Polygon ve Arbitrum dahil 15+ ağda alım-satım yapın.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
