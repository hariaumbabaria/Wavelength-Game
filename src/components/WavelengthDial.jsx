import { useRef, useCallback, useEffect, useState } from 'react';

// Helper to describe an SVG donut/arc wedge
function describeArcWedge(cx, cy, rInner, rOuter, startAngle, endAngle) {
  // Clamp angles to -90..90
  const a1 = Math.max(-90, Math.min(90, startAngle));
  const a2 = Math.max(-90, Math.min(90, endAngle));
  const rad1 = (a1 * Math.PI) / 180;
  const rad2 = (a2 * Math.PI) / 180;

  const x1Outer = cx + rOuter * Math.sin(rad1);
  const y1Outer = cy - rOuter * Math.cos(rad1);
  const x2Outer = cx + rOuter * Math.sin(rad2);
  const y2Outer = cy - rOuter * Math.cos(rad2);

  const x1Inner = cx + rInner * Math.sin(rad1);
  const y1Inner = cy - rInner * Math.cos(rad1);
  const x2Inner = cx + rInner * Math.sin(rad2);
  const y2Inner = cy - rInner * Math.cos(rad2);

  const largeArc = (a2 - a1) > 180 ? 1 : 0;

  return [
    'M', x1Inner, y1Inner,
    'L', x1Outer, y1Outer,
    'A', rOuter, rOuter, 0, largeArc, 1, x2Outer, y2Outer,
    'L', x2Inner, y2Inner,
    'A', rInner, rInner, 0, largeArc, 0, x1Inner, y1Inner,
    'Z'
  ].join(' ');
}

export default function WavelengthDial({
  target = 50,
  guess = 50,
  showTarget = false,
  showNeedle = true,
  interactive = false,
  onGuessChange,
  leftLabel = '',
  rightLabel = '',
}) {
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Map 0-100 to angle in degrees (-90 to +90)
  const posToAngle = (pos) => (pos / 100) * 180 - 90;

  const getPositionFromEvent = useCallback((e) => {
    if (!svgRef.current) return guess;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // Pivot is at y=200 in a 230-high SVG
    const centerY = rect.top + rect.height * (200 / 230);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = centerY - clientY;

    let angle = Math.atan2(dx, dy) * (180 / Math.PI);
    angle = Math.max(-90, Math.min(90, angle));
    return Math.round(((angle + 90) / 180) * 100);
  }, [guess]);

  const handlePointerDown = useCallback((e) => {
    if (!interactive) return;
    setIsDragging(true);
    const pos = getPositionFromEvent(e);
    if (onGuessChange) onGuessChange(pos);
  }, [interactive, getPositionFromEvent, onGuessChange]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !interactive) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPositionFromEvent(e);
    if (onGuessChange) onGuessChange(pos);
  }, [isDragging, interactive, getPositionFromEvent, onGuessChange]);

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

  // Keyboard navigation for accessibility
  const handleKeyDown = (e) => {
    if (!interactive || !onGuessChange) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onGuessChange(Math.max(0, guess - (e.shiftKey ? 5 : 1)));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onGuessChange(Math.min(100, guess + (e.shiftKey ? 5 : 1)));
    }
  };

  const needleAngle = posToAngle(guess);
  const targetAngle = posToAngle(target);

  // Target wedge angle widths:
  // Bullseye 4pts: +-3% = +-5.4 deg
  // Middle 3pts: +-8% = +-14.4 deg
  // Outer 2pts: +-15% = +-27 deg
  const zone2Path = describeArcWedge(200, 200, 130, 192, targetAngle - 27, targetAngle + 27);
  const zone3Path = describeArcWedge(200, 200, 130, 192, targetAngle - 14.4, targetAngle + 14.4);
  const zone4Path = describeArcWedge(200, 200, 130, 192, targetAngle - 5.4, targetAngle + 5.4);

  return (
    <div
      className={`wavelength-dial-wrapper ${interactive ? 'interactive' : ''}`}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      role={interactive ? 'slider' : undefined}
      aria-valuenow={interactive ? guess : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-label="Wavelength spectrum dial"
    >
      <svg
        ref={svgRef}
        viewBox="0 0 400 230"
        className="wavelength-dial-svg"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <defs>
          {/* Main spectrum rainbow gradient */}
          <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff4757" />
            <stop offset="20%" stopColor="#ff6b81" />
            <stop offset="40%" stopColor="#ffa502" />
            <stop offset="60%" stopColor="#ffd93d" />
            <stop offset="80%" stopColor="#2ed573" />
            <stop offset="100%" stopColor="#3742fa" />
          </linearGradient>

          {/* Needle drop shadow */}
          <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
          </filter>

          {/* Target glow filter */}
          <filter id="targetGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer dial housing arc */}
        <path
          d="M 10 200 A 190 190 0 0 1 390 200"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="64"
        />

        {/* Spectrum colored track */}
        <path
          d="M 12 200 A 188 188 0 0 1 388 200"
          fill="none"
          stroke="url(#spectrumGradient)"
          strokeWidth="56"
          opacity="0.35"
        />

        {/* Tick marks */}
        {Array.from({ length: 41 }, (_, i) => {
          const angle = (i / 40) * 180 - 90;
          const rad = (angle * Math.PI) / 180;
          const isMajor = i % 10 === 0;
          const isMedium = i % 5 === 0;
          const r1 = 160;
          const r2 = isMajor ? 190 : isMedium ? 180 : 172;
          const x1 = 200 + r1 * Math.sin(rad);
          const y1 = 200 - r1 * Math.cos(rad);
          const x2 = 200 + r2 * Math.sin(rad);
          const y2 = 200 - r2 * Math.cos(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth={isMajor ? 2.5 : isMedium ? 1.5 : 0.8}
            />
          );
        })}

        {/* TARGET SCORING WEDGES (when revealed) */}
        {showTarget && (
          <g className="target-wedges-group" filter="url(#targetGlow)">
            {/* 2-point zone (outer - orange) */}
            <path d={zone2Path} fill="#f97316" opacity="0.65" />
            {/* 3-point zone (mid - amber) */}
            <path d={zone3Path} fill="#fbbf24" opacity="0.85" />
            {/* 4-point zone (center - bullseye green) */}
            <path d={zone4Path} fill="#10b981" opacity="0.95" />

            {/* Bullseye center line */}
            {(() => {
              const rad = (targetAngle * Math.PI) / 180;
              const x1 = 200 + 128 * Math.sin(rad);
              const y1 = 200 - 128 * Math.cos(rad);
              const x2 = 200 + 194 * Math.sin(rad);
              const y2 = 200 - 194 * Math.cos(rad);
              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* Point labels on wedges */}
            {(() => {
              const rad = (targetAngle * Math.PI) / 180;
              const textR = 161;
              const tx = 200 + textR * Math.sin(rad);
              const ty = 200 - textR * Math.cos(rad);
              return (
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="900"
                  fontFamily="'Space Grotesk', sans-serif"
                >
                  4
                </text>
              );
            })()}
          </g>
        )}

        {/* DIAL NEEDLE */}
        {showNeedle && (
          <g
            transform={`rotate(${needleAngle}, 200, 200)`}
            filter="url(#needleShadow)"
            className="dial-needle-group"
          >
            {/* Needle shaft */}
            <line
              x1="200"
              y1="200"
              x2="200"
              y2="20"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Needle pointer triangle */}
            <polygon
              points="193,32 200,8 207,32"
              fill="#ffffff"
            />
            {/* Needle accent stripe */}
            <line
              x1="200"
              y1="190"
              x2="200"
              y2="45"
              stroke="#ff4757"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Center pivot hub */}
        <circle cx="200" cy="200" r="18" fill="#12122a" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
        <circle cx="200" cy="200" r="10" fill="#8b5cf6" />
        <circle cx="200" cy="200" r="4" fill="#ffffff" />
      </svg>

      {/* Spectrum end labels under the dial */}
      {(leftLabel || rightLabel) && (
        <div className="dial-spectrum-labels">
          <div className="dial-label dial-label-left">
            <span className="dial-arrow">←</span> {leftLabel}
          </div>
          {interactive && (
            <div className="dial-guess-badge">
              {guess}%
            </div>
          )}
          <div className="dial-label dial-label-right">
            {rightLabel} <span className="dial-arrow">→</span>
          </div>
        </div>
      )}
    </div>
  );
}

