import { useState } from 'react';

export default function SetupScreen({ state, actions }) {
  const [teamAName, setTeamAName] = useState('Team 1');
  const [teamBName, setTeamBName] = useState('Team 2');
  const [teamAPlayers, setTeamAPlayers] = useState('');
  const [teamBPlayers, setTeamBPlayers] = useState('');
  const [rounds, setRounds] = useState(5);
  const [customLeft, setCustomLeft] = useState('');
  const [customRight, setCustomRight] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleAddCustom = () => {
    if (customLeft.trim() && customRight.trim()) {
      actions.addCustomCard({ left: customLeft.trim(), right: customRight.trim() });
      setCustomLeft('');
      setCustomRight('');
    }
  };

  const handleStart = () => {
    const parsePlayers = (str) =>
      str.split(',').map(s => s.trim()).filter(Boolean);

    actions.startGame({
      teams: {
        A: { name: teamAName || 'Team 1', players: parsePlayers(teamAPlayers), score: 0 },
        B: { name: teamBName || 'Team 2', players: parsePlayers(teamBPlayers), score: 0 },
      },
      totalRounds: Math.max(1, Math.min(20, rounds)),
    });
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <div className="logo">
          <div className="logo-icon">
            <div className="wave-circle"></div>
            <div className="wave-needle"></div>
          </div>
          <h1>WAVELENGTH</h1>
        </div>
        <p className="tagline">Get on the same wavelength as your team!</p>
        <button className="rules-toggle" onClick={() => setShowRules(!showRules)}>
          {showRules ? 'Hide Rules' : '📖 How to Play'}
        </button>
      </div>

      {showRules && (
        <div className="rules-panel">
          <h3>🎯 How to Play</h3>
          <div className="rules-content">
            <div className="rule-step">
              <span className="step-num">1</span>
              <div>
                <strong>The Psychic</strong> sees a hidden target on the spectrum and gives a one-word or short clue
                to help their team guess where it is.
              </div>
            </div>
            <div className="rule-step">
              <span className="step-num">2</span>
              <div>
                <strong>The Team</strong> discusses and moves the dial to where they think the target is based on the clue.
              </div>
            </div>
            <div className="rule-step">
              <span className="step-num">3</span>
              <div>
                <strong>Reveal & Score!</strong> Bullseye = 4pts, Close = 3pts, Near = 2pts.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="setup-grid">
        <div className="setup-card team-card">
          <h2>🔴 {teamAName || 'Team 1'}</h2>
          <div className="input-group">
            <label>Team Name</label>
            <input
              type="text"
              value={teamAName}
              onChange={e => setTeamAName(e.target.value)}
              placeholder="Team 1"
            />
          </div>
          <div className="input-group">
            <label>Players <span className="hint">(comma-separated)</span></label>
            <input
              type="text"
              value={teamAPlayers}
              onChange={e => setTeamAPlayers(e.target.value)}
              placeholder="Alice, Bob, Charlie"
            />
          </div>
        </div>

        <div className="setup-card team-card">
          <h2>🔵 {teamBName || 'Team 2'}</h2>
          <div className="input-group">
            <label>Team Name</label>
            <input
              type="text"
              value={teamBName}
              onChange={e => setTeamBName(e.target.value)}
              placeholder="Team 2"
            />
          </div>
          <div className="input-group">
            <label>Players <span className="hint">(comma-separated)</span></label>
            <input
              type="text"
              value={teamBPlayers}
              onChange={e => setTeamBPlayers(e.target.value)}
              placeholder="Dave, Eve, Frank"
            />
          </div>
        </div>

        <div className="setup-card rounds-card">
          <h2>🔄 Rounds</h2>
          <div className="rounds-control">
            <button className="round-btn" onClick={() => setRounds(r => Math.max(1, r - 1))}>−</button>
            <span className="round-display">{rounds}</span>
            <button className="round-btn" onClick={() => setRounds(r => Math.min(20, r + 1))}>+</button>
          </div>
          <p className="hint">Each round, both teams take a turn</p>
        </div>

        <div className="setup-card custom-card">
          <h2>✨ Custom Questions</h2>
          <div className="custom-input-row">
            <input
              type="text"
              value={customLeft}
              onChange={e => setCustomLeft(e.target.value)}
              placeholder="Left concept..."
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            />
            <span className="vs-divider">↔</span>
            <input
              type="text"
              value={customRight}
              onChange={e => setCustomRight(e.target.value)}
              placeholder="Right concept..."
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            />
            <button className="add-btn" onClick={handleAddCustom}>Add</button>
          </div>
          {state.customCards.length > 0 && (
            <div className="custom-list">
              {state.customCards.map((card, i) => (
                <div key={i} className="custom-item">
                  <span>{card.left} ↔ {card.right}</span>
                  <button className="remove-btn" onClick={() => actions.removeCustomCard(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
          <p className="hint">Added: {state.customCards.length} custom + 50 default cards</p>
        </div>
      </div>

      <button className="start-btn" onClick={handleStart}>
        <span>🚀 Start Game</span>
      </button>
    </div>
  );
}

