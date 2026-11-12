import React from 'react';
import type { SchematicElement, SchematicSpec } from '../types/circuit';

interface CircuitSchematicProps {
  spec: SchematicSpec;
  liveNodeValues?: Record<string, string>;
}

export const CircuitSchematic: React.FC<CircuitSchematicProps> = ({
  spec,
  liveNodeValues = {},
}) => {
  const width = spec.width ?? 560;
  const height = spec.height ?? 300;

  const renderElement = (el: SchematicElement) => {
    const stroke = el.color ?? '#1e293b';
    const x1 = el.x1;
    const y1 = el.y1;

    if (el.type === 'ground') {
      return (
        <g key={el.id} transform={`translate(${x1}, ${y1})`}>
          <line x1={0} y1={0} x2={0} y2={10} stroke={stroke} strokeWidth={2} />
          <line x1={-13} y1={10} x2={13} y2={10} stroke={stroke} strokeWidth={2.2} />
          <line x1={-8} y1={15} x2={8} y2={15} stroke={stroke} strokeWidth={2} />
          <line x1={-3.5} y1={20} x2={3.5} y2={20} stroke={stroke} strokeWidth={1.8} />
        </g>
      );
    }

    if (el.type === 'port_open') {
      return (
        <g key={el.id} transform={`translate(${x1}, ${y1})`}>
          <circle
            cx={0}
            cy={0}
            r={4.5}
            fill="#ffffff"
            stroke={el.color ?? '#0f172a'}
            strokeWidth={2}
          />
          {el.label && (
            <text
              x={8}
              y={4}
              fontSize={12.5}
              fontWeight={600}
              fill={el.color ?? '#0f172a'}
            >
              {el.label}
            </text>
          )}
        </g>
      );
    }

    const x2 = el.x2 ?? x1;
    const y2 = el.y2 ?? y1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Normal vector pointing "above/left" of line for upright text placement
    let nx = -dy / len;
    let ny = dx / len;
    if (ny > 0.25 || (Math.abs(ny) <= 0.25 && nx > 0)) {
      nx = -nx;
      ny = -ny;
    }

    const labelOffset = el.type === 'wire' ? 13 : 24;
    const lx = midX + nx * labelOffset;
    const ly = midY + ny * labelOffset;
    const subLx = midX - nx * (el.type === 'wire' ? 13 : 24);
    const subLy = midY - ny * (el.type === 'wire' ? 13 : 24);

    if (el.type === 'wire') {
      return (
        <g key={el.id}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={el.dashed ? '5,4' : undefined}
          />
          {el.currentArrow && renderCurrentArrow(x1, y1, x2, y2, el.currentArrow, !!el.currentReverse)}
          {el.label && (
            <text
              x={lx}
              y={ly + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill={el.color ?? '#334155'}
            >
              {el.label}
            </text>
          )}
        </g>
      );
    }

    // Body dimensions in local coordinates along X axis [-len/2, +len/2]
    const half = len / 2;
    let bodyHalf = 20;
    if (el.type === 'capacitor') bodyHalf = 5;
    else if (el.type === 'diode') bodyHalf = 11;
    else if (el.type === 'inductor') bodyHalf = 24;
    else if (el.type === 'switch') bodyHalf = 16;
    else if (
      el.type === 'vsource_dc' ||
      el.type === 'vsource_ac' ||
      el.type === 'isource_dc' ||
      el.type === 'isource_ac' ||
      el.type === 'vcvs' ||
      el.type === 'vccs' ||
      el.type === 'ccvs' ||
      el.type === 'cccs'
    ) {
      bodyHalf = 17;
    }

    // Flip signs inside rotated group? Keep symbols aligned with x1 -> x2!
    // In SPICE & circuit schematics: x1,y1 is '+' / anode / start, x2,y2 is '-' / cathode / end.
    return (
      <g key={el.id}>
        <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
          {/* Lead wires */}
          <line
            x1={-half}
            y1={0}
            x2={-bodyHalf}
            y2={0}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={el.dashed ? '4,3' : undefined}
          />
          <line
            x1={bodyHalf}
            y1={0}
            x2={half}
            y2={0}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={el.dashed ? '4,3' : undefined}
          />

          {/* GB/T 4728 Rectangular Resistor */}
          {el.type === 'resistor' && (
            <rect
              x={-20}
              y={-7.5}
              width={40}
              height={15}
              rx={1.5}
              fill="#ffffff"
              stroke={stroke}
              strokeWidth={2}
            />
          )}

          {/* Capacitor */}
          {el.type === 'capacitor' && (
            <g>
              <line x1={-5} y1={-13} x2={-5} y2={13} stroke={stroke} strokeWidth={2.4} />
              <line x1={5} y1={-13} x2={5} y2={13} stroke={stroke} strokeWidth={2.4} />
            </g>
          )}

          {/* Inductor (4 clean semicircular coils + optional coupling dot) */}
          {el.type === 'inductor' && (
            <g>
              <path
                d="M -24 0 A 6 7 0 0 1 -12 0 A 6 7 0 0 1 0 0 A 6 7 0 0 1 12 0 A 6 7 0 0 1 24 0"
                fill="none"
                stroke={stroke}
                strokeWidth={2.1}
              />
              {el.dotPos === 'start' && (
                <circle cx={-26} cy={-9} r={3.2} fill="#dc2626" />
              )}
              {el.dotPos === 'end' && (
                <circle cx={26} cy={-9} r={3.2} fill="#dc2626" />
              )}
            </g>
          )}

          {/* DC Voltage Source (x1,y1 is +, x2,y2 is -) */}
          {el.type === 'vsource_dc' && (
            <g>
              <circle
                cx={0}
                cy={0}
                r={17}
                fill="#eff6ff"
                stroke="#1d4ed8"
                strokeWidth={2}
              />
              {/* + sign near -bodyHalf (x1 side) */}
              <line x1={-11} y1={0} x2={-5} y2={0} stroke="#1d4ed8" strokeWidth={1.8} />
              <line x1={-8} y1={-3} x2={-8} y2={3} stroke="#1d4ed8" strokeWidth={1.8} />
              {/* - sign near +bodyHalf (x2 side) */}
              <line x1={5} y1={0} x2={11} y2={0} stroke="#1d4ed8" strokeWidth={1.8} />
            </g>
          )}

          {/* AC Voltage Source */}
          {el.type === 'vsource_ac' && (
            <g>
              <circle
                cx={0}
                cy={0}
                r={17}
                fill="#eff6ff"
                stroke="#1d4ed8"
                strokeWidth={2}
              />
              <path
                d="M -9 0 Q -4.5 -8 0 0 T 9 0"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth={2}
                transform={`rotate(${-angleDeg})`}
              />
              {/* tiny + indicator on x1 side */}
              <circle cx={-12} cy={-12} r={1.8} fill="#1d4ed8" />
            </g>
          )}

          {/* DC / AC Current Source (arrow from x1 -> x2) */}
          {(el.type === 'isource_dc' || el.type === 'isource_ac') && (
            <g>
              <circle
                cx={0}
                cy={0}
                r={17}
                fill="#ecfdf5"
                stroke="#047857"
                strokeWidth={2}
              />
              <line x1={-9} y1={0} x2={8} y2={0} stroke="#047857" strokeWidth={2} />
              <polyline
                points="3,-4.5 9.5,0 3,4.5"
                fill="none"
                stroke="#047857"
                strokeWidth={2}
              />
            </g>
          )}

          {/* Controlled Voltage Source (Diamond ◇ with +/-) */}
          {(el.type === 'vcvs' || el.type === 'ccvs') && (
            <g>
              <polygon
                points="-18,0 0,-15 18,0 0,15"
                fill="#fef3c7"
                stroke="#b45309"
                strokeWidth={2}
              />
              <line x1={-10} y1={0} x2={-4} y2={0} stroke="#b45309" strokeWidth={1.8} />
              <line x1={-7} y1={-3} x2={-7} y2={3} stroke="#b45309" strokeWidth={1.8} />
              <line x1={5} y1={0} x2={10} y2={0} stroke="#b45309" strokeWidth={1.8} />
            </g>
          )}

          {/* Controlled Current Source (Diamond ◇ with arrow) */}
          {(el.type === 'vccs' || el.type === 'cccs') && (
            <g>
              <polygon
                points="-18,0 0,-15 18,0 0,15"
                fill="#fef3c7"
                stroke="#b45309"
                strokeWidth={2}
              />
              <line x1={-9} y1={0} x2={8} y2={0} stroke="#b45309" strokeWidth={2} />
              <polyline
                points="3,-4 9,0 3,4"
                fill="none"
                stroke="#b45309"
                strokeWidth={2}
              />
            </g>
          )}

          {/* Diode (Anode x1 -> Cathode x2) */}
          {el.type === 'diode' && (
            <g>
              <polygon
                points="-10,-10 -10,10 10,0"
                fill="#fce7f3"
                stroke="#be185d"
                strokeWidth={2}
              />
              <line x1={10} y1={-10} x2={10} y2={10} stroke="#be185d" strokeWidth={2.4} />
            </g>
          )}

          {/* Switch */}
          {el.type === 'switch' && (
            <g>
              <circle cx={-15} cy={0} r={3} fill="#ffffff" stroke="#dc2626" strokeWidth={2} />
              <circle cx={15} cy={0} r={3} fill="#ffffff" stroke="#dc2626" strokeWidth={2} />
              <line
                x1={-12}
                y1={-1}
                x2={13}
                y2={el.switchOpen ? -13 : -1}
                stroke="#dc2626"
                strokeWidth={2.2}
              />
            </g>
          )}
        </g>

        {/* Reference current arrow along lead wire */}
        {el.currentArrow &&
          renderCurrentArrow(
            x1,
            y1,
            x1 + (dx * 0.27),
            y1 + (dy * 0.27),
            el.currentArrow,
            !!el.currentReverse
          )}

        {/* Voltage reference polarity marks (+   -) */}
        {el.voltageMarks && (
          <g>
            <text
              x={x1 + dx * 0.22 - nx * 16}
              y={y1 + dy * 0.22 - ny * 16 + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="#dc2626"
            >
              {el.voltageMarks.plus}
            </text>
            <text
              x={x1 + dx * 0.78 - nx * 16}
              y={y1 + dy * 0.78 - ny * 16 + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="#dc2626"
            >
              {el.voltageMarks.minus}
            </text>
          </g>
        )}

        {/* Primary Label */}
        {el.label && (
          <text
            x={lx}
            y={ly + 4}
            textAnchor="middle"
            fontSize={12.5}
            fontWeight={700}
            fill="#0f172a"
          >
            {el.label}
          </text>
        )}

        {/* Sub-label (live parameter value) */}
        {el.subLabel && (
          <text
            x={subLx}
            y={subLy + 4}
            textAnchor="middle"
            fontSize={11.5}
            fontWeight={500}
            fill="#475569"
          >
            {el.subLabel}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="schematic-wrapper">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="schematic-svg"
        role="img"
        aria-label="电路原理图"
      >
        <defs>
          <pattern
            id="circuit-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#circuit-grid)" rx={8} />

        {/* Mutual inductance coupling arcs */}
        {spec.mutualArcs?.map((arc, i) => {
          const mx = (arc.x1 + arc.x2) / 2;
          const my = Math.min(arc.y1, arc.y2) - 24;
          return (
            <g key={`m-${i}`}>
              <path
                d={`M ${arc.x1} ${arc.y1} Q ${mx} ${my} ${arc.x2} ${arc.y2}`}
                fill="none"
                stroke="#dc2626"
                strokeWidth={1.6}
                strokeDasharray="4,3"
              />
              <polygon
                points={`${arc.x1 - 3},${arc.y1 - 4} ${arc.x1 + 3},${arc.y1 - 4} ${arc.x1},${arc.y1 + 2}`}
                fill="#dc2626"
              />
              <polygon
                points={`${arc.x2 - 3},${arc.y2 - 4} ${arc.x2 + 3},${arc.y2 - 4} ${arc.x2},${arc.y2 + 2}`}
                fill="#dc2626"
              />
              <text
                x={mx}
                y={my + 6}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill="#dc2626"
              >
                {arc.label}
              </text>
            </g>
          );
        })}

        {/* Circuit Elements */}
        {spec.elements.map(renderElement)}

        {/* Node dots & live voltage badges */}
        {spec.nodes?.map((n, idx) => {
          const liveStr = n.liveExpr ? liveNodeValues[n.liveExpr] : undefined;
          return (
            <g key={`node-${idx}`} transform={`translate(${n.x}, ${n.y})`}>
              <circle cx={0} cy={0} r={3.5} fill={n.color ?? '#0f172a'} />
              <text
                x={0}
                y={-9}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight={700}
                fill={n.color ?? '#1e40af'}
              >
                {n.text}
              </text>
              {liveStr && (
                <g transform="translate(0, -27)">
                  <rect
                    x={-34}
                    y={-10}
                    width={68}
                    height={16}
                    rx={4}
                    fill="#dbeafe"
                    stroke="#93c5fd"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={1.5}
                    textAnchor="middle"
                    fontSize={10.5}
                    fontWeight={700}
                    fill="#1e3a8a"
                  >
                    {liveStr}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Annotations */}
        {spec.annotations?.map((ann, idx) => (
          <g key={`ann-${idx}`} transform={`translate(${ann.x}, ${ann.y})`}>
            {ann.box && (
              <rect
                x={-4}
                y={-13}
                width={ann.text.length * 7.8 + 16}
                height={20}
                rx={4}
                fill="#f8fafc"
                stroke="#cbd5e1"
              />
            )}
            <text
              x={ann.box ? 4 : 0}
              y={0}
              fontSize={ann.fontSize ?? 12}
              fontWeight={ann.bold ? 700 : 500}
              fill={ann.color ?? '#475569'}
            >
              {ann.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

function renderCurrentArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  reverse: boolean
) {
  const sx = reverse ? x2 : x1;
  const sy = reverse ? y2 : y1;
  const ex = reverse ? x1 : x2;
  const ey = reverse ? y1 : y2;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.hypot(dx, dy) || 1;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const nx = -dy / len;
  const ny = dx / len;
  const sign = ny > 0.2 ? -1 : 1;

  return (
    <g>
      <g transform={`translate(${mx}, ${my}) rotate(${angle})`}>
        <polygon points="-5,-4.2 6,0 -5,4.2" fill="#e11d48" />
      </g>
      <text
        x={mx + nx * 13 * sign}
        y={my + ny * 13 * sign + 4}
        textAnchor="middle"
        fontSize={11.5}
        fontWeight={700}
        fill="#e11d48"
      >
        {label}
      </text>
    </g>
  );
}
