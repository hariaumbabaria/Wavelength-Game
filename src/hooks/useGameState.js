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

function randomTarget() {
  return Math.floor(Math.random() * 81) + 10; // 10-90
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

  // startGame now accepts all config directly to avoid batching issues
  const startGame = useCallback((config) => {
    setState(s => {
      const allCards = shuffle([...defaultCards, ...s.customCards]);
      const target = randomTarget();
      return {
        ...s,
        phase: 'psychic',
        cards: allCards,
        cardIndex: 0,
        currentCard: allCards[0],
        target,
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
    setState(s => ({ ...s, clue, phase: 'guessing' }));
  }, []);

  const setGuess = useCallback((val) => {
    setState(s => ({ ...s, guess: val }));
  }, []);

  // Lock guess → calculate score → go straight to reveal
  const lockGuess = useCallback(() => {
    setState(s => {
      const diff = Math.abs(s.guess - s.target);
      let score = 0;
      if (diff <= 3) score = 4;       // bullseye
      else if (diff <= 8) score = 3;  // close
      else if (diff <= 15) score = 2; // near
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
      const nextCard = s.cards[nextCardIndex % s.cards.length];
      const target = randomTarget();

      return {
        ...s,
        phase: 'psychic',
        activeTeam: nextTeam,
        currentRound: nextRoundNum,
        cardIndex: nextCardIndex,
        currentCard: nextCard,
        target,
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
