import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from './GlassCard';
import { Spade, ArrowLeft, RotateCcw, Plus, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const winSound = new Audio('/sounds/win.mp3');
const loseSound = new Audio('/sounds/lose.mp3');

type Card = {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numValue: number;
};

type GameState = 'waiting' | 'playing' | 'playerWin' | 'dealerWin' | 'tie' | 'bust';

const Blackjack: React.FC = () => {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [deck, setDeck] = useState<Card[]>([]);

  const createDeck = (): Card[] => {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: Card[] = [];

    suits.forEach(suit => {
      values.forEach(value => {
        let numValue = parseInt(value);
        if (value === 'A') numValue = 11;
        if (['J', 'Q', 'K'].includes(value)) numValue = 10;
        newDeck.push({ suit, value, numValue });
      });
    });

    return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateScore = (cards: Card[]): number => {
    let score = 0;
    let aces = 0;

    cards.forEach(card => {
      if (card.value === 'A') {
        aces++;
        score += 11;
      } else {
        score += card.numValue;
      }
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  };

  const dealCard = (currentDeck: Card[]) => currentDeck.pop();

  const startGame = () => {
    const newDeck = createDeck();
    const playerStartCards: Card[] = [];
    const dealerStartCards: Card[] = [];

    const card1 = dealCard(newDeck);
    const card2 = dealCard(newDeck);
    const card3 = dealCard(newDeck);
    const card4 = dealCard(newDeck);

    if (card1) playerStartCards.push(card1);
    if (card2) dealerStartCards.push(card2);
    if (card3) playerStartCards.push(card3);
    if (card4) dealerStartCards.push(card4);

    setPlayerCards(playerStartCards);
    setDealerCards(dealerStartCards);
    setDeck(newDeck);
    setGameState('playing');
  };

  const hit = () => {
    const newCard = dealCard([...deck]);
    if (newCard) {
      const newPlayerCards = [...playerCards, newCard];
      setPlayerCards(newPlayerCards);
      setDeck(deck.filter(card => card !== newCard));
      if (calculateScore(newPlayerCards) > 21) {
        loseSound.play();
        setGameState('bust');
      }
    }
  };

  const stand = () => {
    let currentDealerCards = [...dealerCards];
    let currentDeck = [...deck];

    while (calculateScore(currentDealerCards) < 17) {
      const newCard = dealCard(currentDeck);
      if (newCard) {
        currentDealerCards.push(newCard);
        currentDeck = currentDeck.filter(card => card !== newCard);
      }
    }

    setDealerCards(currentDealerCards);
    setDeck(currentDeck);

    const playerScore = calculateScore(playerCards);
    const dealerScore = calculateScore(currentDealerCards);

    if (dealerScore > 21 || playerScore > dealerScore) {
      winSound.play();
      setGameState('playerWin');
    } else if (dealerScore > playerScore) {
      loseSound.play();
      setGameState('dealerWin');
    } else {
      setGameState('tie');
    }
  };

  const resetGame = () => {
    setPlayerCards([]);
    setDealerCards([]);
    setDeck([]);
    setGameState('waiting');
    setTimeout(() => {
      startGame();
    }, 100);
  };

  const renderCard = (card: Card, hidden = false, index = 0) => {
    if (hidden) {
      return (
        <div className="w-20 h-28 bg-gray-700 border border-gray-500 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-xl">?</span>
        </div>
      );
    }

    const filename = `${card.value}_${card.suit}.png`;
    const imagePath = `/cards/${filename}`;

    return (
      <div className="w-20 h-28 rounded-lg shadow-md transform hover:scale-110 transition-all duration-300">
        <img
          src={imagePath}
          alt={`${card.value} of ${card.suit}`}
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      </div>
    );
  };

  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);

  return (
    <div className="min-h-screen bg-mantle-dark text-white flex items-center justify-center px-4">
      <Link to="/" className="fixed top-6 left-6 z-10">
        <Button variant="outline" className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white transition-all duration-300 hover:scale-105">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portal
        </Button>
      </Link>

      <GlassCard className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Spade className="h-12 w-12 mr-3 text-mantle-mint" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-mantle-mint to-mantle-pink bg-clip-text text-transparent">
              Blackjack
            </h1>
          </div>
          <p className="text-gray-400">Get as close to 21 as possible without going bust!</p>
        </div>

        {gameState === 'waiting' && (
          <div className="text-center py-8 space-y-4">
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-mantle-mint to-mantle-pink text-black font-bold px-8 py-3 text-lg hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-mantle-mint/30"
            >
              Start Game
            </Button>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center justify-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 inline-flex">
                <Globe className="h-4 w-4 text-mantle-mint" />
                <span className="text-sm text-gray-300">Online coming soon</span>
              </div>

              <a
                href="https://x.com/Keri_Evd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 inline-flex hover:border-mantle-pink transition-all"
              >
                <span className="text-sm text-gray-400">Cards by Keri</span>
              </a>
            </div>
          </div>
        )}

        {gameState !== 'waiting' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-300">Dealer {gameState !== 'playing' && `(${dealerScore})`}</h3>
              <div className="flex justify-center gap-2 mb-4">
                {dealerCards.map((card, index) => (
                  <div key={index}>{renderCard(card, gameState === 'playing' && index === 1, index)}</div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-300">Your Hand ({playerScore})</h3>
              <div className="flex justify-center gap-2 mb-4">
                {playerCards.map((card, index) => (
                  <div key={index}>{renderCard(card, false, index)}</div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {gameState === 'playing' && (
                <>
                  <Button onClick={hit} className="bg-mantle-mint text-black font-semibold px-6 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-mantle-mint/30">
                    <Plus className="mr-2 h-4 w-4" /> Hit
                  </Button>
                  <Button onClick={stand} className="bg-mantle-pink text-black font-semibold px-6 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-mantle-pink/30">
                    Stand
                  </Button>
                </>
              )}

              {gameState !== 'playing' && gameState !== 'waiting' && (
                <Button onClick={resetGame} className="bg-gradient-to-r from-mantle-mint to-mantle-pink text-black font-bold px-6 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-mantle-mint/30">
                  <RotateCcw className="mr-2 h-4 w-4" /> New Game
                </Button>
              )}
            </div>

            {gameState !== 'playing' && gameState !== 'waiting' && (
              <div className="text-center p-4 border border-gray-600 rounded-lg bg-gray-800/30">
                <p className="text-xl font-bold">
                  {gameState === 'playerWin' && '🎉 You Win!'}
                  {gameState === 'dealerWin' && '😔 Dealer Wins'}
                  {gameState === 'tie' && '🤝 It\'s a Tie!'}
                  {gameState === 'bust' && '💥 Bust! You went over 21'}
                </p>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Blackjack;