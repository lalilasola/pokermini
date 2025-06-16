
'use client';
import { useState, useEffect } from 'react';
import { AuthKitProvider, SignInButton, useProfile } from '@farcaster/auth-kit';
const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: 'pokermini.vercel.app',
  siweUri: 'https://pokermini.vercel.app',
};
interface Card {
  suit: string;
  rank: string;
  emoji: string;
}
const suits = ['♠️', '♥️', '♦️', '♣️'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
function PokerGame() {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<string>('');
  const [isDealt, setIsDealt] = useState(false);
  const { profile, isAuthenticated } = useProfile();
  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({
          suit,
          rank,
          emoji: getCardEmoji(rank, suit)
        });
      });
    });
    return deck;
  };
  const getCardEmoji = (rank: string, suit: string): string => {
    const suitMap: { [key: string]: string } = {
      '♠️': '♠️',
      '♥️': '♥️', 
      '♦️': '♦️',
      '♣️': '♣️'
    };
    return `${rank}${suitMap[suit]}`;
  };
  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const dealCards = () => {
    const deck = shuffleDeck(createDeck());
    const playerHand = deck.slice(0, 2);
    const community = deck.slice(2, 7);
    
    setPlayerCards(playerHand);
    setCommunityCards(community);
    setIsDealt(true);
    
    // Simulate random win/loss
    const isWin = Math.random() > 0.5;
    setGameResult(isWin ? 'You Win! 🎉' : 'You Lose 😔');
  };
  const playAgain = () => {
    setPlayerCards([]);
    setCommunityCards([]);
    setGameResult('');
    setIsDealt(false);
  };
  const CardComponent = ({ card }: { card: Card }) => (
    <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-3 m-1 min-w-[60px] h-[80px] flex flex-col items-center justify-center text-lg font-bold">
      <div className={`${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'}`}>
        {card.rank}
      </div>
      <div className="text-2xl">
        {card.suit}
      </div>
    </div>
  );
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-center shadow-2xl max-w-sm w-full">
          <h1 className="text-3xl font-bold text-green-800 mb-4">🃏 Poker Mini</h1>
          <p className="text-gray-600 mb-6">Connect your Farcaster account to play Texas Hold'em poker!</p>
          <SignInButton />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-green-900 rounded-t-xl p-4 text-white text-center">
          <h1 className="text-2xl font-bold">🃏 Poker Mini</h1>
          {profile && (
            <p className="text-green-300 text-sm mt-1">
              Welcome {profile.displayName} (FID: {profile.fid})
            </p>
          )}
        </div>
        {/* Game Area */}
        <div className="bg-green-700 p-6 rounded-b-xl shadow-2xl">
          
          {/* Community Cards */}
          {communityCards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-lg font-bold mb-3 text-center">Community Cards</h3>
              <div className="flex justify-center flex-wrap gap-1">
                {communityCards.map((card, index) => (
                  <CardComponent key={index} card={card} />
                ))}
              </div>
            </div>
          )}
          {/* Player Cards */}
          {playerCards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-lg font-bold mb-3 text-center">Your Cards</h3>
              <div className="flex justify-center gap-2">
                {playerCards.map((card, index) => (
                  <CardComponent key={index} card={card} />
                ))}
              </div>
            </div>
          )}
          {/* Game Result */}
          {gameResult && (
            <div className="mb-6 text-center">
              <div className="bg-white rounded-lg p-4 mx-4">
                <h2 className="text-2xl font-bold text-green-800">{gameResult}</h2>
              </div>
            </div>
          )}
          {/* Buttons */}
          <div className="text-center space-y-3">
            {!isDealt ? (
              <button
                onClick={dealCards}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105 w-full max-w-xs"
              >
                🎰 Deal Cards
              </button>
            ) : (
              <button
                onClick={playAgain}
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105 w-full max-w-xs"
              >
                🔄 Play Again
              </button>
            )}
          </div>
          {/* Poker Chips Decoration */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full border-4 border-white shadow-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <AuthKitProvider config={config}>
      <PokerGame />
    </AuthKitProvider>
  );
}
