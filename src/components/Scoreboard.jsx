export default function Scoreboard({ teams }) {
  return (
    <div className="scoreboard">
      <div className="scoreboard-item team-A">
        <span className="sb-icon">🔴</span>
        <span className="sb-name">{teams.A.name}</span>
        <span className="sb-score">{teams.A.score}</span>
      </div>
      <div className="scoreboard-divider">|</div>
      <div className="scoreboard-item team-B">
        <span className="sb-icon">🔵</span>
        <span className="sb-name">{teams.B.name}</span>
        <span className="sb-score">{teams.B.score}</span>
      </div>
    </div>
  );
}

