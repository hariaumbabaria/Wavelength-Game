import useGameState from './hooks/useGameState';
import SetupScreen from './components/SetupScreen';
import PsychicPhase from './components/PsychicPhase';
import GuessingPhase from './components/GuessingPhase';
import RevealPhase from './components/RevealPhase';
import GameOver from './components/GameOver';
import Scoreboard from './components/Scoreboard';

function App() {
  const { state, actions } = useGameState();

  const renderPhase = () => {
    switch (state.phase) {
      case 'setup':
        return <SetupScreen state={state} actions={actions} />;
      case 'psychic':
        return <PsychicPhase state={state} actions={actions} />;
      case 'guessing':
        return <GuessingPhase state={state} actions={actions} />;
      case 'reveal':
        return <RevealPhase state={state} actions={actions} />;
      case 'gameOver':
        return <GameOver state={state} actions={actions} />;
      default:
        return null;
    }
  };

  const showScoreboard = state.phase !== 'setup' && state.phase !== 'gameOver';

  return (
    <div className="app">
      <div className="background-effects">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>
      {showScoreboard && <Scoreboard teams={state.teams} />}
      <main className="game-main">
        {renderPhase()}
      </main>
    </div>
  );
}

export default App;
