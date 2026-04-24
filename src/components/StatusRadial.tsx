import { useMemo, useState } from "react";

type Props = {
  statuses: string[];
  applied: string[];
  onToggle: (status: string) => void;
  onClose: () => void;
};

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(12);
}

const CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Exhaustion",
  "Frightened",
  "Paralyzed",
  "Petrified",
  "Stunned",
  "Unconscious",
];

const EFFECTS = [
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Poisoned",
  "Prone",
  "Restrained",
];

export function StatusRadial({ applied, onToggle, onClose }: Props) {
  const [closing, setClosing] = useState(false);

  const outer = useMemo(() => CONDITIONS, []);
  const inner = useMemo(() => EFFECTS, []);

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.95;
  const radius = size / 2;

  const outerRadius = radius;
  const innerRadius = radius * 0.62;
  const coreRadius = radius * 0.28;

  const center = radius;

  const outerStep = (2 * Math.PI) / outer.length;
  const innerStep = (2 * Math.PI) / inner.length;

  function vibrateTap() {
    vibrate();
  }

  function polar(angle: number, r: number) {
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  function ringPath(i: number, rOuter: number, rInner: number, step: number) {
    const start = i * step - Math.PI / 2;
    const end = start + step;

    const p1 = polar(start, rInner);
    const p2 = polar(start, rOuter);
    const p3 = polar(end, rOuter);
    const p4 = polar(end, rInner);

    return `
      M ${p1.x} ${p1.y}
      L ${p2.x} ${p2.y}
      A ${rOuter} ${rOuter} 0 0 1 ${p3.x} ${p3.y}
      L ${p4.x} ${p4.y}
      A ${rInner} ${rInner} 0 0 0 ${p1.x} ${p1.y}
      Z
    `;
  }

  function labelPos(i: number, step: number, rInner: number, rOuter: number) {
    const angle = i * step + step / 2 - Math.PI / 2;
    const r = rInner + (rOuter - rInner) * 0.67;
    return polar(angle, r);
  }

  function handleSelect(status: string) {
    vibrateTap();
    onToggle(status);
    setClosing(true);

    setTimeout(() => {
      onClose();
    }, 120);
  }

  return (
    <div className="radial-backdrop" onClick={onClose}>
      <div
        className={`radial-wrap ${closing ? "radial-out" : "radial-in"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* CENTER */}
          <circle
            cx={center}
            cy={center}
            r={coreRadius}
            fill="#0d0d0d"
            stroke="#330000"
          />

          {/* OUTER (conditions) */}
          {outer.map((s, i) => {
            const active = applied.includes(s);
            const label = labelPos(i, outerStep, coreRadius, outerRadius);

            return (
              <g key={s} onClick={() => handleSelect(s)}>
                <path
                  d={ringPath(i, outerRadius, innerRadius, outerStep)}
                  fill={active ? "#2a0f0f" : "#141414"}
                  stroke={active ? "#ff4d4d" : "#330000"}
                  className="radial-slice"
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill={active ? "#ff4d4d" : "#aaa"}
                  fontSize="11"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {s}
                </text>
              </g>
            );
          })}

          {/* INNER (effects) */}
          {inner.map((s, i) => {
            const active = applied.includes(s);
            const label = labelPos(i, innerStep, innerRadius, coreRadius);

            return (
              <g key={s} onClick={() => handleSelect(s)}>
                <path
                  d={ringPath(i, innerRadius, coreRadius, innerStep)}
                  fill={active ? "#2a0f0f" : "#1a1a1a"}
                  stroke={active ? "#ff4d4d" : "#440000"}
                  className="radial-slice"
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill={active ? "#ff4d4d" : "#ddd"}
                  fontSize="11"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {s}
                </text>
              </g>
            );
          })}
        </svg>

        <button className="radial-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}