import { useState, useCallback } from 'react';
import defaultCards from '../data/spectrumCards';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Format card with 50% chance to flip left and right
function formatCard(card) {
  if (!card) return null;
  if (Math.random() < 0.5) {
    return { left: card.right, right: card.left };
  }
  return { left: card.left, right: card.right };
}

// Balanced target generator: creates a bag of 6 segments (3 left, 3 right)
// guarantees no more than 2 consecutive targets on the same side
function createTargetBag(lastSide1 = null, lastSide2 = null) {
  const segments = [
    { name: 'far-left', min: 14, max: 24, side: 'left' },
    { name: 'mid-left', min: 26, max: 37, side: 'left' },
    { name: 'center-left', min: 39, max: 47, side: 'left' },
    { name: 'center-right', min: 53, max: 61, side: 'right' },
    { name: 'mid-right', min: 63, max: 74, side: 'right' },
    { name: 'far-right', min: 76, max: 86, side: 'right' },
  ];

  for (let attempt = 0; attempt < 500; attempt++) {
    const shuffled = [...segments].sort(() => Math.random() - 0.5);
    const fullSequence = [];
    if (lastSide2) fullSequence.push(lastSide2);
    if (lastSide1) fullSequence.push(lastSide1);
    shuffled.forEach(s => fullSequence.push(s.side));

    let valid = true;
    for (let i = 0; i < fullSequence.length - 2; i++) {
      if (fullSequence[i] === fullSequence[i + 1] && fullSequence[i] === fullSequence[i + 2]) {
        valid = false;
        break;
      }
    }
    if (valid) {
      return shuffled.map(s => Math.floor(Math.random() * (s.max - s.min + 1)) + s.min);
    }
  }

  // Fallback: alternate left/right deterministically
  const lefts = [
    Math.floor(Math.random() * 11) + 14, // 14-24
    Math.floor(Math.random() * 12) + 26, // 26-37
    Math.floor(Math.random() * 9) + 39,  // 39-47
  ].sort(() => Math.random() - 0.5);

  const rights = [
    Math.floor(Math.random() * 9) + 53,  // 53-61
    Math.floor(Math.random() * 12) + 63, // 63-74
    Math.floor(Math.random() * 11) + 76, // 76-86
  ].sort(() => Math.random() - 0.5);

  const startWithRight = lastSide1 === 'left';
  const res = [];
  for (let i = 0; i < 3; i++) {
    if (startWithRight) {
      res.push(rights[i], lefts[i]);
    } else {
      res.push(lefts[i], rights[i]);
    }
  }
  return res;
}

function getNextTarget(targetBag = [], recentSides = []) {
  let bag = [...targetBag];
  const sides = [...recentSides];

  if (bag.length === 0) {
    const s1 = sides.length > 0 ? sides[sides.length - 1] : null;
    const s2 = sides.length > 1 ? sides[sides.length - 2] : null;
    bag = createTargetBag(s1, s2);
  }

  const target = bag.shift();
  const side = target < 50 ? 'left' : 'right';
  const updatedSides = [...sides.slice(-3), side];

  return { target, targetBag: bag, recentSides: updatedSides };
}

/*
  Game phases:
  - setup       : configure players, teams, rounds, custom questions
  - psychic     : the psychic sees the target, picks a clue
  - guessing    : team guesses position on the dial
  - reveal      : show target, calculate score
  - gameOver    : final scores
*/

const INITIAL_STATE = {
  phase: 'setup',
  teams: { A: { name: 'Team 1', players: [], score: 0 }, B: { name: 'Team 2', players: [], score: 0 } },
  totalRounds: 5,
  currentRound: 1,
  activeTeam: 'A',
  psychicIndex: { A: 0, B: 0 },
  cards: [],
  cardIndex: 0,
  currentCard: null,
  target: 50,
  targetBag: [],
  recentSides: [],
  guess: 50,
  clue: '',
  roundScore: 0,
  customCards: [],
  history: [],
};

export default function useGameState() {
  const [state, setState] = useState(INITIAL_STATE);

  const addCustomCard = useCallback((card) => {
    setState(s => ({ ...s, customCards: [...s.customCards, card] }));
  }, []);

  const removeCustomCard = useCallback((index) => {
    setState(s => ({ ...s, customCards: s.customCards.filter((_, i) => i !== index) }));
  }, []);

  // startGame accepts all config directly
  const startGame = useCallback((config) => {
    setState(s => {
      const allCards = shuffle([...defaultCards, ...s.customCards]);
      const { target, targetBag, recentSides } = getNextTarget([], []);
      const firstCard = formatCard(allCards[0]);

      return {
        ...s,
        phase: 'psychic',
        cards: allCards,
        cardIndex: 0,
        currentCard: firstCard,
        target,
        targetBag,
        recentSides,
        currentRound: 1,
        activeTeam: 'A',
        guess: 50,
        clue: '',
        totalRounds: config.totalRounds,
        teams: {
          A: { ...config.teams.A, score: 0 },
          B: { ...config.teams.B, score: 0 },
        },
        psychicIndex: { A: 0, B: 0 },
        history: [],
        roundScore: 0,
      };
    });
  }, []);

  const submitClue = useCallback((clue) => {
    setState(s => ({ ...s, clue, phase: 'guessing', guess: 50 }));
  }, []);

  const setGuess = useCallback((val) => {
    setState(s => ({ ...s, guess: Math.max(0, Math.min(100, val)) }));
  }, []);

  // Lock guess → calculate score → go straight to reveal
  const lockGuess = useCallback(() => {
    setState(s => {
      const diff = Math.abs(s.guess - s.target);
      let score = 0;
      if (diff <= 3) score = 4;       // bullseye: +-3%
      else if (diff <= 8) score = 3;  // close: +-8%
      else if (diff <= 15) score = 2; // near: +-15%
      else score = 0;

      const activeTeamKey = s.activeTeam;

      return {
        ...s,
        phase: 'reveal',
        roundScore: score,
        teams: {
          ...s.teams,
          [activeTeamKey]: {
            ...s.teams[activeTeamKey],
            score: s.teams[activeTeamKey].score + score,
          },
        },
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState(s => {
      const currentTeam = s.activeTeam;
      const nextTeam = currentTeam === 'A' ? 'B' : 'A';
      // A full round = both teams have played (B just finished)
      const roundComplete = currentTeam === 'B';
      const nextRoundNum = roundComplete ? s.currentRound + 1 : s.currentRound;
      const isGameOver = roundComplete && s.currentRound >= s.totalRounds;

      const historyEntry = {
        round: s.currentRound,
        team: s.teams[currentTeam].name,
        card: s.currentCard,
        clue: s.clue,
        target: s.target,
        guess: s.guess,
        score: s.roundScore,
      };

      if (isGameOver) {
        return { ...s, phase: 'gameOver', history: [...s.history, historyEntry] };
      }

      const nextCardIndex = s.cardIndex + 1;
      const rawCard = s.cards[nextCardIndex % s.cards.length];
      const nextCard = formatCard(rawCard);
      const { target, targetBag, recentSides } = getNextTarget(s.targetBag, s.recentSides);

      return {
        ...s,
        phase: 'psychic',
        activeTeam: nextTeam,
        currentRound: nextRoundNum,
        cardIndex: nextCardIndex,
        currentCard: nextCard,
        target,
        targetBag,
        recentSides,
        guess: 50,
        clue: '',
        roundScore: 0,
        psychicIndex: {
          ...s.psychicIndex,
          [currentTeam]: (s.psychicIndex[currentTeam] + 1) % (s.teams[currentTeam].players.length || 1),
        },
        history: [...s.history, historyEntry],
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(s => ({ ...INITIAL_STATE, customCards: s.customCards }));
  }, []);

  return {
    state,
    actions: {
      addCustomCard,
      removeCustomCard,
      startGame,
      submitClue,
      setGuess,
      lockGuess,
      nextRound,
      resetGame,
    },
  };
}
