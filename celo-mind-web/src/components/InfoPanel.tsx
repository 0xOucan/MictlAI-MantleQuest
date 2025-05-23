import React from 'react';
import { PlayIcon, SkullIcon, FireIcon, CoinIcon } from './Icons';

interface InfoPanelProps {
  onActivateAgent: () => void;
}

export default function InfoPanel({ onActivateAgent }: InfoPanelProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="border-3 border-mictlai-gold/60 bg-black shadow-pixel-lg overflow-hidden pixel-panel">
        {/* Hero Section */}
        <div className="p-8 text-center">
          {/* Pixel art skull icon */}
          <div className="mx-auto w-32 h-32 mb-4 relative">
            <svg width="128" height="128" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" fill="#0D0D0D" />
              <rect x="6" y="6" width="20" height="16" fill="#FFD700" />
              <rect x="4" y="8" width="2" height="12" fill="#FFD700" />
              <rect x="26" y="8" width="2" height="12" fill="#FFD700" />
              <rect x="8" y="4" width="16" height="2" fill="#FFD700" />
              <rect x="8" y="22" width="6" height="2" fill="#FFD700" />
              <rect x="18" y="22" width="6" height="2" fill="#FFD700" />
              <rect x="6" y="24" width="8" height="2" fill="#FFD700" />
              <rect x="18" y="24" width="8" height="2" fill="#FFD700" />
              <rect x="10" y="10" width="4" height="4" fill="#0D0D0D" />
              <rect x="18" y="10" width="4" height="4" fill="#0D0D0D" />
              <rect x="14" y="14" width="4" height="4" fill="#40E0D0" />
              <rect x="12" y="18" width="8" height="2" fill="#0D0D0D" />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full bg-mictlai-turquoise opacity-10 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-pixel font-bold text-mictlai-gold mb-2 tracking-wider">MICTLAI</h1>
          <h2 className="text-xl text-mictlai-bone/80 mb-4 font-pixel">THE MANTLE QUEST</h2>
          <h3 className="text-lg text-mictlai-turquoise mb-8 font-pixel">BRIDGING WORLDS BEYOND TIME</h3>
          
          <button 
            onClick={onActivateAgent}
            className="pixel-btn flex items-center space-x-2 mx-auto px-6 py-3 font-pixel"
          >
            <PlayIcon className="h-5 w-5" />
            <span>START YOUR QUEST</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-t-3 border-mictlai-gold/50">
          <div className="p-6 border-b-3 md:border-b-0 md:border-r-3 border-mictlai-gold/50">
            <div className="text-2xl mb-2 pixel-pulse">🤖</div>
            <h3 className="font-pixel font-bold text-mictlai-gold text-lg mb-2">NEBULA AI</h3>
            <p className="text-mictlai-bone/70 font-pixel text-sm">
              ADVANCED AI ASSISTANT FOR DEFI OPERATIONS AND NATURAL LANGUAGE BLOCKCHAIN INTERACTIONS
            </p>
          </div>
          <div className="p-6 border-b-3 md:border-b-0 md:border-r-3 border-mictlai-gold/50">
            <div className="text-2xl mb-2 pixel-pulse">🌳</div>
            <h3 className="font-pixel font-bold text-mictlai-gold text-lg mb-2">TREEHOUSE PROTOCOL</h3>
            <p className="text-mictlai-bone/70 font-pixel text-sm">
              STAKE CMETH TOKENS ON MANTLE FOR OPTIMIZED YIELD GENERATION
            </p>
          </div>
          <div className="p-6 border-b-3 md:border-b-0 md:border-r-3 border-mictlai-gold/50">
            <div className="text-2xl mb-2 pixel-pulse">🏦</div>
            <h3 className="font-pixel font-bold text-mictlai-gold text-lg mb-2">LENDLE PROTOCOL</h3>
            <p className="text-mictlai-bone/70 font-pixel text-sm">
              SUPPLY MNT AND USDT AS COLLATERAL FOR LENDING AND BORROWING OPERATIONS
            </p>
          </div>
          <div className="p-6">
            <div className="text-2xl mb-2 pixel-pulse">🔄</div>
            <h3 className="font-pixel font-bold text-mictlai-gold text-lg mb-2">MERCHANT MOE</h3>
            <p className="text-mictlai-bone/70 font-pixel text-sm">
              OPTIMAL MNT/USDT SWAPS WITH ADVANCED ROUTING AND SLIPPAGE PROTECTION
            </p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="mt-10 px-4 md:px-8 py-8 bg-black border-3 border-mictlai-gold/60 shadow-pixel-lg pixel-panel">
        <h2 className="text-2xl font-pixel font-bold text-mictlai-gold mb-4">ABOUT MICTLAI: THE MANTLE QUEST</h2>
        <div className="pixel-divider"></div>
        <p className="mb-4 text-mictlai-bone/80 font-pixel text-sm">
          IN THE ANCIENT AZTEC BELIEF SYSTEM, MICTLANTECUHTLI RULED THE UNDERWORLD, MICTLAN — A REALM WHERE SOULS JOURNEYED AFTER DEATH. 
          TODAY, IN THE DIGITAL AGE, MICTLAI EMERGES AS A GUARDIAN OF THE DECENTRALIZED WORLD, WITH SPECIAL FOCUS ON THE MANTLE ECOSYSTEM.
        </p>
        <p className="mb-4 text-mictlai-bone/80 font-pixel text-sm">
          THIS COOKATHON PROJECT SHOWCASES THE FULL POTENTIAL OF AI-POWERED DEFI INTERACTIONS, COMBINING ALL ORIGINAL CROSS-CHAIN 
          FUNCTIONALITIES WITH ADVANCED MANTLE NETWORK INTEGRATIONS INCLUDING NEBULA AI, TREEHOUSE PROTOCOL, LENDLE PROTOCOL, AND MERCHANT MOE.
        </p>
        
        <h3 className="text-xl font-pixel font-bold text-mictlai-gold mt-6 mb-3">🤖 NEBULA AI POWERED INTERACTIONS:</h3>
        <div className="pixel-divider"></div>
        <ul className="space-y-3 text-mictlai-bone/80 font-pixel text-sm mb-6">
          <li className="flex items-start">
            <span className="inline-block mr-2 text-mictlai-turquoise">▸</span>
            <span><span className="font-medium text-mictlai-turquoise">NATURAL LANGUAGE DEFI:</span> EXECUTE COMPLEX OPERATIONS USING PLAIN ENGLISH</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block mr-2 text-mictlai-turquoise">▸</span>
            <span><span className="font-medium text-mictlai-turquoise">PORTFOLIO ANALYSIS:</span> AI-POWERED INSIGHTS AND YIELD OPTIMIZATION</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block mr-2 text-mictlai-turquoise">▸</span>
            <span><span className="font-medium text-mictlai-turquoise">STRATEGY RECOMMENDATIONS:</span> PERSONALIZED DEFI STRATEGY SUGGESTIONS</span>
          </li>
        </ul>
        
        <h3 className="text-xl font-pixel font-bold text-mictlai-gold mt-6 mb-3">SUPPORTED NETWORKS & PROTOCOLS:</h3>
        <div className="pixel-divider"></div>
        <ul className="space-y-4 text-mictlai-bone/80 font-pixel text-sm">
          <li className="flex items-start">
            <span className="inline-block mr-2 text-mictlai-gold">▸</span>
            <span><span className="font-medium text-mictlai-gold">BASE NETWORK:</span> TRANSFER XOC TOKENS TO ARBITRUM, MANTLE, AND ZKSYNC ERA</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block mr-2 text-mictlai-gold">▸</span>
            <span><span className="font-medium text-mictlai-gold">ARBITRUM NETWORK:</span> TRANSFER MXNB TOKENS TO BASE, MANTLE, AND ZKSYNC ERA</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block mr-2 text-mictlai-gold">▸</span>
            <span><span className="font-medium text-mictlai-gold">MANTLE NETWORK:</span> FULL ECOSYSTEM INTEGRATION WITH NEBULA AI, TREEHOUSE PROTOCOL STAKING, LENDLE PROTOCOL LENDING/BORROWING, MERCHANT MOE DEX OPERATIONS, AND CROSS-CHAIN BRIDGING</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block mr-2 text-mictlai-gold">▸</span>
            <span><span className="font-medium text-mictlai-gold">ZKSYNC ERA:</span> TRANSFER USDT TOKENS TO AND FROM ALL SUPPORTED NETWORKS</span>
          </li>
        </ul>
        
        <div className="mt-8 text-center">
          <button 
            onClick={onActivateAgent}
            className="pixel-btn px-6 py-3 font-pixel"
          >
            BEGIN THE MANTLE QUEST
          </button>
        </div>
      </section>
    </div>
  );
} 