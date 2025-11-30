import { useState } from "react";
import {
  Rocket,
  Gift,
  CheckCircle,
  Loader,
  Wallet,
  ArrowRight,
  Coins,
  TrendingUp,
  Brain,
  Award,
  Target,
} from "lucide-react";

interface OnboardingProps {
  walletAddress: string;
  selectedChain: "ethereum" | "solana";
  onComplete: () => void;
}

interface TestToken {
  symbol: string;
  name: string;
  amount: string;
  icon: string;
  color: string;
}

interface QuizAnswer {
  question: string;
  answer: string;
  score: number;
}

export default function Onboarding({
  walletAddress,
  selectedChain,
  onComplete,
}: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [claimedTokens, setClaimedTokens] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [tokenMultiplier, setTokenMultiplier] = useState(1);

  const quizQuestions = [
    {
      question: "What is your experience level with Web3 and cryptocurrencies?",
      icon: <Brain size={32} color="#FF6B00" />,
      options: [
        {
          text: "Beginner - Just getting started",
          value: "beginner",
          score: 1,
        },
        {
          text: "Intermediate - I've made some transactions",
          value: "intermediate",
          score: 1.5,
        },
        {
          text: "Advanced - I actively trade and use DeFi",
          value: "advanced",
          score: 2,
        },
        {
          text: "Expert - I develop smart contracts",
          value: "expert",
          score: 2.5,
        },
      ],
    },
    {
      question: "What is your primary goal with this wallet?",
      icon: <Target size={32} color="#00C853" />,
      options: [
        { text: "Learning and exploring Web3", value: "learning", score: 1 },
        { text: "Trading and investing", value: "trading", score: 1.5 },
        { text: "DeFi and yield farming", value: "defi", score: 2 },
        { text: "NFTs and digital collectibles", value: "nfts", score: 1.5 },
      ],
    },
    {
      question: "How much test balance would you like to start with?",
      icon: <Award size={32} color="#2196F3" />,
      options: [
        {
          text: "Small - Just enough to try features ($50)",
          value: "small",
          score: 0.5,
        },
        { text: "Medium - Good for testing ($200)", value: "medium", score: 1 },
        {
          text: "Large - Ready for serious testing ($500)",
          value: "large",
          score: 2,
        },
        {
          text: "Maximum - I want to test everything ($1000)",
          value: "maximum",
          score: 3,
        },
      ],
    },
  ];

  const testTokens: TestToken[] =
    selectedChain === "ethereum"
      ? [
          {
            symbol: "ETH",
            name: "Ethereum",
            amount: (0.5 * tokenMultiplier).toFixed(2),
            icon: "⟠",
            color: "#627EEA",
          },
          {
            symbol: "USDT",
            name: "Tether USD",
            amount: (100 * tokenMultiplier).toFixed(0),
            icon: "₮",
            color: "#26A17B",
          },
          {
            symbol: "USDC",
            name: "USD Coin",
            amount: (100 * tokenMultiplier).toFixed(0),
            icon: "⊙",
            color: "#2775CA",
          },
        ]
      : [
          {
            symbol: "SOL",
            name: "Solana",
            amount: (2 * tokenMultiplier).toFixed(1),
            icon: "◎",
            color: "#14F195",
          },
          {
            symbol: "USDT",
            name: "Tether USD",
            amount: (100 * tokenMultiplier).toFixed(0),
            icon: "₮",
            color: "#26A17B",
          },
          {
            symbol: "USDC",
            name: "USD Coin",
            amount: (100 * tokenMultiplier).toFixed(0),
            icon: "⊙",
            color: "#2775CA",
          },
        ];

  const steps = [
    {
      title: "Welcome to Your Wallet! 🎉",
      description:
        "You've successfully created your secure multi-chain wallet. Let's get you started with some test tokens!",
      icon: <Rocket size={48} color="#FF6B00" />,
    },
    {
      title: "Quick Assessment 📋",
      description:
        "Help us personalize your experience by answering a few questions. Your test token allocation will be based on your answers.",
      icon: <Brain size={48} color="#9C27B0" />,
    },
    {
      title: "Claim Your Test Tokens 🎁",
      description:
        "We'll send you test tokens to explore all the features. These are testnet tokens for learning purposes.",
      icon: <Gift size={48} color="#00C853" />,
    },
    {
      title: "You're All Set! 🚀",
      description:
        "Your wallet is funded and ready. Start exploring swaps, sends, and portfolio tracking!",
      icon: <CheckCircle size={48} color="#2196F3" />,
    },
  ];

  const handleQuizAnswer = (
    question: string,
    answer: string,
    score: number
  ) => {
    const newAnswer: QuizAnswer = { question, answer, score };
    setQuizAnswers((prev) => [...prev, newAnswer]);
    setSelectedAnswer("");

    if (currentQuizQuestion < quizQuestions.length - 1) {
      setCurrentQuizQuestion((prev) => prev + 1);
    } else {
      // Calculate total score and multiplier
      const totalScore = [...quizAnswers, newAnswer].reduce(
        (sum, a) => sum + a.score,
        0
      );
      const avgScore = totalScore / quizQuestions.length;
      setTokenMultiplier(avgScore);

      // Move to token claim step
      setTimeout(() => {
        setCurrentStep(2);
      }, 500);
    }
  };

  const handleClaimTokens = async () => {
    setIsClaimingTokens(true);

    // Simulate token claiming process
    for (let i = 0; i < testTokens.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setClaimedTokens((prev) => [...prev, testTokens[i].symbol]);
    }

    setIsClaimingTokens(false);
    setTimeout(() => {
      setCurrentStep(3);
    }, 500);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 2) {
      handleClaimTokens();
    }
  };

  const handleSkip = () => {
    if (currentStep === 1) {
      // Skip quiz - use default multiplier
      setTokenMultiplier(1);
      setCurrentStep(2);
    } else {
      onComplete();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Animation */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Main Container */}
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "#111",
          border: "1px solid #222",
          borderRadius: "24px",
          padding: "48px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Progress Bar */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "40px",
          }}
        >
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: "4px",
                background:
                  index <= currentStep
                    ? "linear-gradient(90deg, #FF6B00 0%, #FF8533 100%)"
                    : "#333",
                borderRadius: "2px",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "96px",
              height: "96px",
              background:
                currentStep === 0
                  ? "linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)"
                  : currentStep === 1
                  ? "linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)"
                  : currentStep === 2
                  ? "linear-gradient(135deg, #00C853 0%, #00E676 100%)"
                  : "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)",
              margin: "0 auto 24px",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                currentStep === 0
                  ? "0 12px 40px rgba(255, 107, 0, 0.4)"
                  : currentStep === 1
                  ? "0 12px 40px rgba(156, 39, 176, 0.4)"
                  : currentStep === 2
                  ? "0 12px 40px rgba(0, 200, 83, 0.4)"
                  : "0 12px 40px rgba(33, 150, 243, 0.4)",
              animation: "slideIn 0.5s ease-out",
            }}
          >
            {steps[currentStep].icon}
          </div>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#fff",
              margin: "0 0 16px 0",
              animation: "slideIn 0.5s ease-out",
            }}
          >
            {steps[currentStep].title}
          </h1>

          <p
            style={{
              color: "#999",
              fontSize: "16px",
              lineHeight: "1.6",
              animation: "slideIn 0.5s ease-out",
            }}
          >
            {steps[currentStep].description}
          </p>
        </div>

        {/* Wallet Address Display */}
        {currentStep === 0 && (
          <div
            style={{
              background: "#0a0a0a",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "32px",
              animation: "slideIn 0.6s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <Wallet size={20} color="#FF6B00" />
              <span
                style={{
                  color: "#999",
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Your {selectedChain === "ethereum" ? "Ethereum" : "Solana"}{" "}
                Address
              </span>
            </div>
            <div
              style={{
                fontFamily:
                  "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                fontSize: "13px",
                color: selectedChain === "ethereum" ? "#627EEA" : "#14F195",
                wordBreak: "break-all",
                fontWeight: "500",
                letterSpacing: "-0.02em",
              }}
            >
              {walletAddress}
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {currentStep === 1 && (
          <div
            style={{
              marginBottom: "32px",
              animation: "slideIn 0.6s ease-out",
            }}
          >
            <div
              style={{
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              {/* Quiz Progress */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    color: "#999",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Question {currentQuizQuestion + 1} of {quizQuestions.length}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {quizQuestions.map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          index < currentQuizQuestion
                            ? "#9C27B0"
                            : index === currentQuizQuestion
                            ? "#BA68C8"
                            : "#333",
                        transition: "all 0.3s",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Current Question */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  {quizQuestions[currentQuizQuestion].icon}
                </div>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "600",
                    lineHeight: "1.4",
                  }}
                >
                  {quizQuestions[currentQuizQuestion].question}
                </h3>
              </div>

              {/* Answer Options */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {quizQuestions[currentQuizQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedAnswer(option.value);
                      setTimeout(() => {
                        handleQuizAnswer(
                          quizQuestions[currentQuizQuestion].question,
                          option.text,
                          option.score
                        );
                      }, 300);
                    }}
                    disabled={selectedAnswer !== ""}
                    style={{
                      padding: "16px 20px",
                      background:
                        selectedAnswer === option.value
                          ? "rgba(156, 39, 176, 0.2)"
                          : "rgba(255, 255, 255, 0.02)",
                      border:
                        selectedAnswer === option.value
                          ? "2px solid #9C27B0"
                          : "1px solid #333",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: selectedAnswer === "" ? "pointer" : "default",
                      textAlign: "left",
                      transition: "all 0.3s",
                      opacity:
                        selectedAnswer !== "" && selectedAnswer !== option.value
                          ? 0.5
                          : 1,
                    }}
                    onMouseOver={(e) => {
                      if (selectedAnswer === "") {
                        e.currentTarget.style.background =
                          "rgba(156, 39, 176, 0.1)";
                        e.currentTarget.style.borderColor = "#9C27B0";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedAnswer === "") {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.02)";
                        e.currentTarget.style.borderColor = "#333";
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{option.text}</span>
                      {selectedAnswer === option.value && (
                        <CheckCircle size={20} color="#9C27B0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(156, 39, 176, 0.1)",
                border: "1px solid rgba(156, 39, 176, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "13px",
                color: "#BA68C8",
                lineHeight: "1.6",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Award size={16} style={{ flexShrink: 0 }} />
              <span>
                Your answers will help us determine the{" "}
                <strong>optimal test token allocation</strong> for your needs.
              </span>
            </div>
          </div>
        )}

        {/* Token Claiming Section */}
        {currentStep === 2 && (
          <div
            style={{
              marginBottom: "32px",
              animation: "slideIn 0.6s ease-out",
            }}
          >
            {/* Allocation Result */}
            {quizAnswers.length > 0 ? (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(186, 104, 200, 0.1) 100%)",
                  border: "1px solid rgba(156, 39, 176, 0.3)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Award size={24} color="#BA68C8" />
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    Your Personalized Allocation
                  </h3>
                </div>
                <p
                  style={{
                    color: "#999",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  Based on your responses, we've calculated a{" "}
                  <strong style={{ color: "#BA68C8" }}>
                    {tokenMultiplier.toFixed(1)}x multiplier
                  </strong>{" "}
                  for your test tokens.{" "}
                  {tokenMultiplier >= 2
                    ? "Great! You'll have plenty to explore all features."
                    : tokenMultiplier >= 1.5
                    ? "Perfect for getting started with most features."
                    : "A great starting point to learn the basics."}
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(255, 165, 0, 0.1)",
                  border: "1px solid rgba(255, 165, 0, 0.3)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Coins size={24} color="#FFA500" />
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    Default Allocation
                  </h3>
                </div>
                <p
                  style={{
                    color: "#999",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  You've received the{" "}
                  <strong style={{ color: "#FFA500" }}>
                    standard allocation
                  </strong>{" "}
                  of test tokens. This is perfect for getting started!
                </p>
              </div>
            )}

            <div
              style={{
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Coins size={20} color="#FF6B00" />
                Test Tokens to Claim
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {testTokens.map((token, index) => {
                  const isClaimed = claimedTokens.includes(token.symbol);
                  const isClaiming =
                    isClaimingTokens && claimedTokens.length === index;

                  return (
                    <div
                      key={token.symbol}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px",
                        background: isClaimed
                          ? "rgba(0, 200, 83, 0.1)"
                          : "rgba(255, 255, 255, 0.02)",
                        border: isClaimed
                          ? "1px solid rgba(0, 200, 83, 0.3)"
                          : "1px solid #222",
                        borderRadius: "12px",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            background: token.color,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            opacity: isClaimed ? 1 : 0.7,
                          }}
                        >
                          {token.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              color: "#fff",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            {token.amount} {token.symbol}
                          </div>
                          <div
                            style={{
                              color: "#666",
                              fontSize: "12px",
                            }}
                          >
                            {token.name}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isClaimed ? (
                          <CheckCircle size={24} color="#00C853" />
                        ) : isClaiming ? (
                          <Loader
                            size={24}
                            color="#FF6B00"
                            style={{
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              border: "2px solid #333",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                background: "rgba(33, 150, 243, 0.1)",
                border: "1px solid rgba(33, 150, 243, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "13px",
                color: "#2196F3",
                lineHeight: "1.6",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <TrendingUp size={16} style={{ flexShrink: 0 }} />
              <span>
                These are <strong>testnet tokens</strong> for learning and
                testing. They have no real-world value.
              </span>
            </div>
          </div>
        )}

        {/* Completion Section */}
        {currentStep === 3 && (
          <div
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(33, 150, 243, 0.3)",
              borderRadius: "16px",
              padding: "32px 24px",
              marginBottom: "32px",
              textAlign: "center",
              animation: "slideIn 0.6s ease-out",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(33, 150, 243, 0.1)",
                padding: "16px",
                borderRadius: "16px",
                marginBottom: "16px",
              }}
            >
              <CheckCircle size={48} color="#2196F3" />
            </div>
            <h3
              style={{
                color: "#fff",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Tokens Successfully Claimed!
            </h3>
            <p
              style={{
                color: "#999",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Your wallet is now funded with test tokens. You're ready to
              explore swaps, sends, and more!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          {currentStep < 3 && (
            <button
              onClick={handleSkip}
              style={{
                flex: 1,
                background: "transparent",
                color: "#999",
                border: "1px solid #333",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#666";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#333";
                e.currentTarget.style.color = "#999";
              }}
            >
              {currentStep === 1 ? "Use Default Allocation" : "Skip for Now"}
            </button>
          )}

          {currentStep !== 1 && (
            <button
              onClick={currentStep === 3 ? onComplete : handleNext}
              disabled={isClaimingTokens}
              style={{
                flex: 2,
                background: isClaimingTokens
                  ? "#333"
                  : currentStep === 0
                  ? "#FF6B00"
                  : currentStep === 2
                  ? "#00C853"
                  : "#2196F3",
                color: "#fff",
                border: "none",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: isClaimingTokens ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: isClaimingTokens
                  ? "none"
                  : currentStep === 0
                  ? "0 8px 24px rgba(255, 107, 0, 0.3)"
                  : currentStep === 2
                  ? "0 8px 24px rgba(0, 200, 83, 0.3)"
                  : "0 8px 24px rgba(33, 150, 243, 0.3)",
              }}
              onMouseOver={(e) => {
                if (!isClaimingTokens) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseOut={(e) => {
                if (!isClaimingTokens) {
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isClaimingTokens ? (
                <>
                  <Loader
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Claiming Tokens...
                </>
              ) : currentStep === 3 ? (
                <>
                  Go to Dashboard
                  <ArrowRight size={18} />
                </>
              ) : currentStep === 2 ? (
                <>
                  <Gift size={18} />
                  Claim Test Tokens
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.5;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
