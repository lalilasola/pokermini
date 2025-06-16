

'use client';

import { useState, useEffect } from 'react';
import { AuthKitProvider, SignInButton, useProfile } from '@farcaster/auth-kit';
import sdk from '@farcaster/frame-sdk';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

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
  const [isDealing, setIsDealing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

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

  const connectWallet = async () => {
    if (!isSDKLoaded) return;

    setIsConnectingWallet(true);
    try {
      const result = await sdk.actions.openWalletConnector();
      if (result.isConnected && result.walletAddress) {
        setWalletAddress(result.walletAddress);
        console.log('Wallet connected:', result.walletAddress);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

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

  const dealCards = async () => {
    setIsDealing(true);

    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 800));

    const deck = shuffleDeck(createDeck());
    const player = [deck[0], deck[1]];
    const community = [deck[2], deck[3], deck[4], deck[5], deck[6]];

    setPlayerCards(player);
    setCommunityCards(community);
    setIsDealt(true);
    setGameResult('');
    setIsDealing(false);
  };

  const evaluateHand = async () => {
    setIsEvaluating(true);

    // Add a delay to show evaluation process
    await new Promise(resolve => setTimeout(resolve, 1200));

    const isWin = Math.random() > 0.5;
    setGameResult(isWin ? 'You Win! 🎉' : 'You Lose 😔');
    setIsEvaluating(false);

    // Share result to Farcaster
    if (isSDKLoaded && isWin) {
      const playerHand = playerCards.map(c => `${c.rank}${c.suit}`).join(' ');
      const winMessage = `Just won a poker hand! 🃏🎉\n\nMy cards: ${playerHand}\n\nCome play Poker Mini!`;
      try {
        sdk.actions.openComposer({
          text: winMessage,
          embeds: [{
            url: 'https://pokermini.vercel.app'
          }]
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
    setIsDealing(false);
    setIsEvaluating(false);
  };

  const shareGame = () => {
    if (isSDKLoaded) {
      try {
        sdk.actions.openComposer({
          text: 'Just played Poker Mini! 🃏 Test your luck at Texas Hold\'em poker.\n\nTry it out:',
          embeds: [{
            url: 'https://pokermini.vercel.app'
          }]
        });
      } catch (error) {
        console.log('Could not open composer:', error);
      }
    }
  };

  const LoadingSpinner = () => (
    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
  );

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
          {!isSDKLoaded ? (
            <div className="flex items-center justify-center py-3">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <SignInButton />
          )}
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
          {walletAddress && (
            <p className="text-green-200 text-xs mt-1">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
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

          {/* Wallet Connection */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                disabled={isConnectingWallet || !isSDKLoaded}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center mx-auto"
              >
                {isConnectingWallet ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Connecting...</span>
                  </>
                ) : (
                  '🔗 Connect Wallet'
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-600 font-semibold">✅ Wallet Connected</span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isDealt ? (
              <button
                onClick={dealCards}
                disabled={isDealing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isDealing ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Dealing Cards...</span>
                  </>
                ) : (
                  'Deal Cards'
                )}
              </button>
            ) : !gameResult ? (
              <button
                onClick={evaluateHand}
                disabled={isEvaluating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isEvaluating ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Evaluating Hand...</span>
                  </>
                ) : (
                  'Show Result'
                )}
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
