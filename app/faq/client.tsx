"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Coins, Shield, Zap, Users, Settings, HelpCircle } from "lucide-react";

// FAQ data structure with static English text
const faqData = [
  {
    category: "Payout Systems",
    icon: <Coins className="w-5 h-5" />,
    questions: [
      {
        question: "What is PPLNS (Pay Per Last N Shares)?",
        answer: "PPLNS is a payout method that rewards miners based on their contribution to the last N shares before a block is found, encouraging long-term mining and fair reward distribution."
      },
      {
        question: "What is SOLO mining?",
        answer: "SOLO mining allows you to mine independently while using our pool's infrastructure. If you find a block, you keep the entire block reward (minus pool fee)."
      },
      {
        question: "How does PPS (Pay Per Share) work?",
        answer: "PPS provides instant payouts for each share you submit, regardless of whether the pool finds a block. This offers predictable earnings but typically has a higher pool fee."
      },
      {
        question: "What is PPBS (Pay Per Block Share)?",
        answer: "PPBS is a hybrid system that combines elements of proportional and PPS methods, providing a balance between consistent payouts and pool sustainability."
      },
      {
        question: "How does PPLNSBF (PPLNS with Block Finder) work?",
        answer: "PPLNSBF is an enhanced version of PPLNS that provides additional rewards to the miner who finds a block, while still maintaining the benefits of PPLNS for all participants."
      }
    ]
  },
  {
    category: "Pool Features",
    icon: <Zap className="w-5 h-5" />,
    questions: [
      {
        question: "What is Multi-Stratum support?",
        answer: "Our pool supports multiple stratum protocols, allowing you to connect with various mining software and different port configurations for optimal performance."
      },
      {
        question: "How does vardiff (Variable Difficulty) work?",
        answer: "Variable difficulty automatically adjusts your mining difficulty based on your hashrate to optimize share submission frequency and improve mining efficiency."
      },
      {
        question: "What regions do you support?",
        answer: "We operate stratum servers in multiple regions including North America, Europe, and Asia-Pacific to ensure low latency connections for miners worldwide."
      }
    ]
  },
  {
    category: "Getting Started",
    icon: <Users className="w-5 h-5" />,
    questions: [
      {
        question: "How do I start mining?",
        answer: "Getting started is simple: 1) Choose your preferred cryptocurrency from our supported coins, 2) Configure your mining software with our stratum details, 3) Set your wallet address as the username, 4) Start mining and monitor your progress on our dashboard. No registration required - just point your miners at our pool and start earning!"
      },
      {
        question: "What mining software is supported?",
        answer: "Our pool is compatible with all major mining software including but not limited to: CGMiner, BFGMiner, Awesome Miner, NiceHash Miner, T-Rex, TeamRedMiner, lolMiner, NBMiner, and many others. We support both GPU and ASIC miners with optimized configurations for maximum efficiency."
      },
      {
        question: "What are the minimum payout thresholds?",
        answer: "Minimum payout thresholds vary by cryptocurrency to balance transaction costs with payout frequency. Typically ranging from 0.01 to 0.1 coins depending on the asset. You can view specific thresholds on each coin's pool page. We also offer manual payout options for larger miners who prefer custom payout schedules."
      }
    ]
  },
  {
    category: "Security & Reliability",
    icon: <Shield className="w-5 h-5" />,
    questions: [
      {
        question: "How secure is the pool?",
        answer: "We implement enterprise-grade security measures including DDoS protection, encrypted connections, real-time monitoring, and redundant infrastructure. Our systems are regularly audited and updated to protect against threats. We maintain 99.9%+ uptime and have never lost user funds in our operational history."
      },
      {
        question: "How do you prevent pool hopping?",
        answer: "Our PPLNS implementation naturally discourages pool hopping by requiring miners to build up their share history before receiving full rewards. The system tracks your recent contributions and rewards consistent participation, making pool hopping unprofitable while maintaining fairness for dedicated miners."
      },
      {
        question: "What happens if the pool goes down?",
        answer: "We maintain redundant infrastructure across multiple data centers. If one server experiences issues, traffic is automatically redirected to healthy servers. Our systems are designed for 99.9%+ uptime. In the rare event of extended downtime, all accumulated shares and balances are preserved and payments continue once systems are restored."
      }
    ]
  },
  {
    category: "Technical Details",
    icon: <Settings className="w-5 h-5" />,
    questions: [
      {
        question: "What algorithms do you support?",
        answer: "We support a wide range of mining algorithms including SHA-256, Scrypt, Ethash, Equihash, X11, Blake2s, CryptoNight variants, and many others. Our infrastructure is continuously updated to support new algorithms and cryptocurrencies as they emerge in the market."
      },
      {
        question: "How often are payouts processed?",
        answer: "Payouts are processed automatically based on the cryptocurrency's network characteristics and your chosen payout method. Most coins have payouts every few hours, while others may be daily. PPS users receive more frequent payouts, while PPLNS users receive payouts when blocks are found and matured."
      },
      {
        question: "Can I monitor my mining progress?",
        answer: "Yes! Our comprehensive dashboard provides real-time monitoring of your hashrate, shares, earnings, and payout history. You can track your miners individually, set up alerts for offline workers, and view detailed statistics including charts and performance analytics. Mobile-friendly interface ensures you can monitor from anywhere."
      }
    ]
  },
  {
    category: "Fees & Economics",
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        question: "What are your pool fees?",
        answer: "Our pool fees are competitive and transparent, typically ranging from 1-2% depending on the cryptocurrency and payout method. SOLO mining has lower fees since there's no reward distribution complexity. All fees are clearly displayed on each coin's pool page, and there are no hidden charges or surprise fees."
      },
      {
        question: "How are transaction fees handled?",
        answer: "Network transaction fees for payouts are automatically deducted from your earnings based on current network conditions. We optimize transaction batching to minimize fees while ensuring timely payouts. During high network congestion, we may delay payouts slightly to reduce fees for all users."
      }
    ]
  }
];

export function FAQClient() {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  
  // Using static FAQ data in English

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleQuestion = (question: string) => {
    setOpenQuestions(prev => 
      prev.includes(question) 
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="relative w-full overflow-hidden min-h-screen">
      {/* Background Design - Theme Aware */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 dark:to-muted/10" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs - Theme Aware */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-primary/20 dark:to-secondary/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-blue-500/15 to-purple-500/15 dark:from-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern - Theme Aware */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating Icons - Theme Aware */}
        <motion.div
          className="absolute top-32 right-32 text-primary/15 dark:text-primary/10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-32 text-secondary/15 dark:text-secondary/10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-medium text-foreground leading-tight mb-4"
            variants={itemVariants}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Find answers to common questions about our mining pool
          </motion.p>
          <motion.div 
            className="bg-background/80 dark:bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-6 my-8 text-center"
            variants={itemVariants}
          >
            <p className="text-muted-foreground mb-4">
              This site provides blockchain explorers for several crypto-currencies.
              We do not provide any currency exchange, wallet or money services. We only present public blockchain data.
            </p>
            <p className="text-muted-foreground">
              Please review our <Link href="/terms" className="text-primary hover:underline font-medium">Disclaimer & Terms of Service</Link> for more information.
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {faqData.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              className="bg-background/80 dark:bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg"
              variants={itemVariants}
            >
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full p-6 text-left hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{category.category}</h2>
                </div>
                {openCategories.includes(category.category) ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                )}
              </button>
              
              {openCategories.includes(category.category) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border/30"
                >
                  {category.questions.map((faq, questionIndex) => (
                    <div key={questionIndex} className="border-b border-border/20 last:border-b-0">
                      <button
                        onClick={() => toggleQuestion(faq.question)}
                        className="w-full p-6 text-left hover:bg-muted/20 transition-colors duration-200 flex items-center justify-between"
                      >
                        <h3 className="text-lg font-medium text-foreground pr-4">{faq.question}</h3>
                        {openQuestions.includes(faq.question) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" />
                        )}
                      </button>
                      
                      {openQuestions.includes(faq.question) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6"
                        >
                          <div className="bg-muted/30 dark:bg-muted/40 rounded-lg p-4 border-l-4 border-primary/40">
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-2xl p-8 border border-border/30">
            <h3 className="text-xl font-semibold text-foreground mb-2">Need more help?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/support" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                Contact Support
              </a>
              <a 
                href="/docs" 
                className="inline-flex items-center justify-center px-6 py-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors duration-200"
              >
                View Documentation
              </a>
            </div>
          </div>
        </motion.div>

        {/* Arabic Section */}
        <motion.div 
          className="mt-16 bg-background/80 dark:bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          dir="rtl"
        >
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Disclaimer & Terms of Service</h3>
        </motion.div>
      </div>
    </section>
  );
}