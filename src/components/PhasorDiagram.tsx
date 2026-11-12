import React from 'react';
import type { PhasorConfig } from '../types/circuit';

interface PhasorDiagramProps {
  phasors: PhasorConfig[];
  params: Record<string, number>;
  simMetrics: Record<string, number>;
}

export const PhasorDiagram: React.FC<PhasorDiagramProps> = ({
  phasors,
  params,
  simMetrics,
}) => {
  const computed = phasors.map((p) => {
    const mag = Math.max(0, p.magExpr(params, simMetrics));
    let deg = p.angleDegExpr(params, simMetrics);
    while (deg > 180) deg -= 360;
    while (deg <= -180) deg += 360;
    return {
      ...p,
      mag,
      deg,
      category: p.category ?? (p.unit.includes('A') ? 'current' : 'voltage'),
    };
  });

  const maxV = Math.max(
    ...computed.filter((c) => c.category === 'voltage').map((c) => c.mag),
    1e-9
  );
  const maxI = Math.max(
    ...computed.filter((c) => c.category === 'current').map((c) => c.mag),
    1e-9
  );

  const S = 260;
  const cx = S / 2;
  const cy = S / 2;
  const R = 96;

  return (
    <div className="phasor-panel">
      <div className="phasor-header">
        <h4>复平面相量图 (Phasor Diagram)</h4>
        <span>电压/电流分类归一化显示</span>
      </div>
      <div className="phasor-body">
        <svg viewBox={`0 0 ${S} ${S}`} className="phasor-svg">
          <circle cx={cx} cy={cy} r={R} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
          <circle
            cx={cx}
            cy={cy}
            r={R * 0.66}
            fill="none"
            stroke="#e2e8f0"
            strokeDasharray="3,3"
          />
          <circle
            cx={cx}
            cy={cy}
            r={R * 0.33}
            fill="none"
            stroke="#e2e8f0"
            strokeDasharray="3,3"
          />
          <line x1={cx - R - 12} y1={cy} x2={cx + R + 12} y2={cy} stroke="#94a3b8" strokeWidth={1.2} />
          <line x1={cx} y1={cy - R - 12} x2={cx} y2={cy + R + 12} stroke="#94a3b8" strokeWidth={1.2} />
          <text x={cx + R + 5} y={cy - 4} fontSize={10.5} fontWeight={700} fill="#475569">
            +1
          </text>
          <text x={cx + 5} y={cy - R - 3} fontSize={10.5} fontWeight={700} fill="#475569">
            +j
          </text>

          {computed.map((p, idx) => {
            const norm =
              p.category === 'current'
                ? (p.mag / maxI) * (R * 0.82)
                : (p.mag / maxV) * (R * 0.94);
            if (norm < 3) return null;
            const rad = (p.deg * Math.PI) / 180;
            const ex = cx + norm * Math.cos(rad);
            const ey = cy - norm * Math.sin(rad);
            const angleSvg = -p.deg;

            return (
              <g key={idx}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={ex}
                  y2={ey}
                  stroke={p.color}
                  strokeWidth={2.5}
                />
                <g transform={`translate(${ex}, ${ey}) rotate(${angleSvg})`}>
                  <polygon points="-8,-4 1,0 -8,4" fill={p.color} />
                </g>
                <text
                  x={cx + (norm + 14) * Math.cos(rad)}
                  y={cy - (norm + 14) * Math.sin(rad) + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={p.color}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={3} fill="#0f172a" />
        </svg>

        <div className="phasor-list">
          {computed.map((p, idx) => (
            <div key={idx} className="phasor-item">
              <span className="phasor-swatch" style={{ backgroundColor: p.color }} />
              <span className="phasor-name">{p.label}</span>
              <span className="phasor-polar">
                {p.mag.toPrecision(4)} ∠ {p.deg.toFixed(1)}° {p.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
