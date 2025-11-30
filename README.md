# MasterWallet - Powered by Tether WDK 🚀

MasterWallet, **Tether WDK (Wallet Development Kit)** kullanılarak geliştirilmiş, çok zincirli (Multi-Chain), yapay zeka destekli ve kullanıcı dostu bir web3 cüzdan uygulamasıdır. Hem yeni başlayanlar için basit bir arayüz sunar hem de profesyoneller için gelişmiş DeFi araçları (Swap, Bridge, AI Pools) içerir.

![Project Status](https://img.shields.io/badge/Status-Beta-orange) ![License](https://img.shields.io/badge/License-MIT-blue) ![Tech](https://img.shields.io/badge/Built%20With-Tether%20WDK-green)

---

## 🌟 Öne Çıkan Özellikler

- **Çoklu Zincir Desteği (Multi-Chain):** Ethereum (Sepolia/Mainnet), Solana (Devnet/Testnet) ve Bitcoin (adres görüntüleme) ağlarını tek bir seed phrase ile yönetin.
- **WDK Entegrasyonu:** Tether WDK kullanılarak oluşturulan non-custodial (kullanıcı kontrollü) cüzdan yapısı.
- **Hibrit Giriş Sistemi:** İster geleneksel "Seed Phrase" ile, ister **Google Hesabı** (Firebase Auth) ile deterministik cüzdan oluşturma.
- **Swap & Bridge:**
  - **Swap:** EVM ağlarında Velora DEX ve Solana ağında Jupiter (simülasyon/native) entegrasyonu.
  - **Bridge:** Farklı ağlar arası varlık transferi arayüzü.
- **AI Destekli Yatırım Havuzları:** Risk profiline göre (Aggressive, Balanced, Conservative) yapay zeka tarafından yönetilen havuz simülasyonları.
- **AI Sesli Asistan:** Sesli komutlarla cüzdan bakiyesi sorgulama ve işlemlere yönlendirme yapan entegre Chatbot.
- **Dashboard & Analiz:** Portföy takibi, fiyat grafikleri (Sparkline) ve varlık dağılımı.

---

## 🛠 Teknoloji Yığını

- **Frontend:** React 19, TypeScript, Vite
- **Wallet SDK:** @tetherto/wdk (EVM, Solana, BTC modülleri)
- **Authentication:** Firebase Auth (Google Sign-In)
- **UI/UX:** Lucide React (İkonlar), Özel CSS (Glassmorphism tasarım)
- **Polyfills:** vite-plugin-node-polyfills (Browser ortamında Node.js modüllerini çalıştırmak için)

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd MasterWallet
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
# veya
yarn install
```

### 3. Çevresel Değişkenleri (.env) Ayarlayın

Kök dizinde `.env` dosyası oluşturun ve Firebase yapılandırma bilgilerinizi ekleyin. (Not: Proje içinde örnek `.env` dosyası bulunabilir, lütfen kendi anahtarlarınızı kullanın)

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Uygulamayı Başlatın

Geliştirme sunucusunu başlatmak için:

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresine gidin.

---

## 📂 Proje Yapısı

```
src/
├── assets/          # Görseller ve logolar
├── components/      # React bileşenleri (Wallet, Swap, Bridge, Dashboard vb.)
├── services/        # İş mantığı servisleri
│   ├── firebaseAuth.ts  # Google Auth işlemleri
│   └── walletService.ts # WDK entegrasyonu ve zincir işlemleri
├── App.tsx          # Ana uygulama yönlendirmesi
└── main.tsx         # Uygulama giriş noktası
```

---

### 3. Ağ Desteği 🌐

Uygulama varsayılan olarak **Sepolia (ETH)** ve **Devnet (SOL)** test ağlarında çalışmaktadır. Gerçek varlıklarla işlem yapmadan önce ağ ayarlarının kontrol edilmesi önerilir.

---

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için lütfen önce tartışmak amacıyla bir issue açınız.

---

**Developed for Tether WDK Hackathon using ❤️ and ☕.**
