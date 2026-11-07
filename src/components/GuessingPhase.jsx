import { useRef, useCallback, useEffect, useState } from 'react';

export default function GuessingPhase({ state, actions }) {
  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const team = state.teams[state.activeTeam];

  const positionToAngle = (pos) => {
    // Map 0-100 to -90deg to +90deg (semicircle)
    return (pos / 100) * 180 - 90;
  };

  const getPositionFromEvent = useCallback((e) => {
    if (!dialRef.current) return state.guess;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - centerX;
    const dy = centerY - clientY;
    
    let angle = Math.atan2(dx, dy) * (180 / Math.PI);
    // Clamp to -90..90
    angle = Math.max(-90, Math.min(90, angle));
    // Map to 0-100
    return Math.round(((angle + 90) / 180) * 100);
  }, [state.guess]);

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    const pos = getPositionFromEvent(e);
    actions.setGuess(pos);
  }, [getPositionFromEvent, actions]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getPositionFromEvent(e);
    actions.setGuess(pos);
  }, [isDragging, getPositionFromEvent, actions]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const needleAngle = positionToAngle(state.guess);

  return (
    <div className="phase-container guessing-phase">
      <div className="phase-header">
        <div className="round-badge">Round {state.currentRound}/{state.totalRounds}</div>
        <div className={`team-indicator team-${state.activeTeam}`}>
          {state.activeTeam === 'A' ? '🔴' : '🔵'} {team.name}'s Turn
        </div>
      </div>

      <div className="clue-display">
        <span className="clue-label">The clue is:</span>
        <span className="clue-word">"{state.clue}"</span>
      </div>

      <div className="spectrum-card-display">
        <div className="spectrum-label left">{state.currentCard.left}</div>
        <div className="spectrum-bar">
          <div className="spectrum-gradient"></div>
        </div>
        <div className="spectrum-label right">{state.currentCard.right}</div>
      </div>

      <div className="dial-container" ref={dialRef}>
        <svg viewBox="0 0 400 220" className="dial-svg"
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          {/* Semicircle background */}
          <defs>
            <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="25%" stopColor="#FFA07A" />
              <stop offset="50%" stopColor="#FFD93D" />
              <stop offset="75%" stopColor="#6BCB77" />
              <stop offset="100%" stopColor="#4D96FF" />
            </linearGradient>
            <clipPath id="semicircle">
              <path d="M 10 200 A 190 190 0 0 1 390 200 L 390 200 L 10 200 Z" />
            </clipPath>
          </defs>
          
          {/* Dial background */}
          <path
            d="M 10 200 A 190 190 0 0 1 390 200"
            fill="none"
            stroke="url(#dialGradient)"
            strokeWidth="60"
            strokeLinecap="butt"
            opacity="0.3"
          />
          
          {/* Tick marks */}
          {Array.from({ length: 21 }, (_, i) => {
            const angle = (i / 20) * 180 - 90;
            const rad = (angle * Math.PI) / 180;
            const r1 = 160;
            const r2 = i % 5 === 0 ? 185 : 175;
            const x1 = 200 + r1 * Math.sin(rad);
            const y1 = 200 - r1 * Math.cos(rad);
            const x2 = 200 + r2 * Math.sin(rad);
            const y2 = 200 - r2 * Math.cos(rad);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.4)" strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            );
          })}

          {/* Needle */}
          <g transform={`rotate(${needleAngle}, 200, 200)`}>
            <line x1="200" y1="200" x2="200" y2="30"
              stroke="white" strokeWidth="4" strokeLinecap="round"
            />
            <polygon
              points="194,40 200,15 206,40"
              fill="white"
            />
          </g>

          {/* Center knob */}
          <circle cx="200" cy="200" r="15" fill="#1a1a2e" stroke="white" strokeWidth="3" />
          <circle cx="200" cy="200" r="8" fill="white" opacity="0.5" />
        </svg>

        <div className="guess-value">{state.guess}%</div>
      </div>

      <p className="instruction">
        🖱️ Click or drag the dial to set your guess!
      </p>

      <button className="lock-btn" onClick={actions.lockGuess}>
        🔒 Lock In Guess
      </button>
    </div>
  );
}

