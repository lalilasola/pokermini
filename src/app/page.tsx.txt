
'use client';

import { useState, useEffect } from 'react';
import { AuthKitProvider, SignInButton, useProfile } from '@farcaster/auth-kit';
import sdk from '@farcaster/frame-sdk';

const config = {
  rpcUrl: 'https://mainnet.base.io',
  domain: 'pokermini.vercel.app',
  siweUri: 'https://pokermini.vercel.app',
};

type Card = {
  rank: string;
  suit: string;
};

const suits = ['♠️', '♥️', '♦️', '♣️'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function GameComponent() {
  const { isAuthenticated, profile } = useProfile();
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState('');
  const [isDealt, setIsDealt] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      console.log('Farcaster context:', context);
      sdk.actions.ready();
      setIsSDKLoaded(true);
    };
    
    if (sdk && !isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded]);

  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
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
    const player = [deck[0], deck[1]];
    const community = [deck[2], deck[3], deck[4], deck[5], deck[6]];
    
    setPlayerCards(player);
    setCommunityCards(community);
    setIsDealt(true);
    setGameResult('');
  };

  const evaluateHand = () => {
    const isWin = Math.random() > 0.5;
    setGameResult(isWin ? 'You Win! 🎉' : 'You Lose 😔');
    
    // Share result to Farcaster
    if (isSDKLoaded && isWin) {
      const winMessage = `Just won a hand in Poker Mini! 🃏🎉 ${playerCards.map(c => `${c.rank}${c.suit}`).join(' ')}`;
      try {
        sdk.actions.openComposer({
          text: winMessage,
        });
      } catch (error) {
        console.log('Could not open composer:', error);
      }
    }
  };

  const playAgain = () => {
    setPlayerCards([]);
    setCommunityCards([]);
    setGameResult('');
    setIsDealt(false);
  };

  const shareGame = () => {
    if (isSDKLoaded) {
      try {
        sdk.actions.openComposer({
          text: 'Come play Poker Mini with me! 🃏',
          embeds: [{
            url: 'https://pokermini.vercel.app'
          }]
        });
      } catch (error) {
        console.log('Could not open composer:', error);
      }
    }
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
              Welcome {profile.displayName || profile.username}!
            </p>
          )}
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-b-xl p-6 space-y-6">
          {/* Community Cards */}
          {isDealt && (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Community Cards</h2>
              <div className="flex justify-center flex-wrap">
                {communityCards.map((card, index) => (
                  <CardComponent key={index} card={card} />
                ))}
              </div>
            </div>
          )}

          {/* Player Cards */}
          {isDealt && (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Your Hand</h2>
              <div className="flex justify-center">
                {playerCards.map((card, index) => (
                  <CardComponent key={index} card={card} />
                ))}
              </div>
            </div>
          )}

          {/* Game Result */}
          {gameResult && (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-800">{gameResult}</h2>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isDealt ? (
              <button
                onClick={dealCards}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Deal Cards
              </button>
            ) : !gameResult ? (
              <button
                onClick={evaluateHand}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Show Result
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={playAgain}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={shareGame}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Share on Farcaster
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthKitProvider config={config}>
      <GameComponent />
    </AuthKitProvider>
  );
}
