import { useMemo, useState } from "react";

type Props = {
  onSelect: (value: number) => void;
  onCancel: () => void;
};

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(12);
}

export function InitiativePicker({ onSelect, onCancel }: Props) {
  const [closing, setClosing] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const outer = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 1), []);
  const inner = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 21), []);

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  const radius = size / 2;

  const outerRadius = radius;
  const innerRadius = radius * 0.62;
  const coreRadius = radius * 0.28;

  const center = radius;

  const outerStep = (2 * Math.PI) / outer.length;
  const innerStep = (2 * Math.PI) / inner.length;

  function polar(angle: number, r: number) {
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  function ringPath(index: number, rOuter: number, rInner: number, step: number) {
    const start = index * step - Math.PI / 2;
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

  function labelPos(index: number, step: number, rInner: number, rOuter: number) {
    const angle = index * step + step / 2 - Math.PI / 2;
    const r = (rInner + rOuter) / 2;
    return polar(angle, r);
  }

  function select(value: number) {
    if (closing) return;

    setSelectedValue(value);
    vibrate();

    setClosing(true);

    setTimeout(() => {
        onSelect(value);
    }, 160);
    }

  return (
    <div 
      className="radial-backdrop"
      onClick={() => {
        if (closing) return;

        setClosing(true);
        setTimeout(() => onCancel(), 180);
      }}
    >
      <div
        className={`radial-wrap ${closing ? "radial-out" : "radial-in"}`}
        onClick={(e) => e.stopPropagation()}
        >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="radial-svg"
        >
          {/* Core center */}
          <circle
            cx={center}
            cy={center}
            r={coreRadius}
            fill="#0d0d0d"
            stroke="#330000"
          />

          {/* INNER RING (21–40) */}
          {inner.map((v, i) => {
            const label = labelPos(i, innerStep, coreRadius, innerRadius);

            return (
              <g
                key={v}
                onClick={() => select(v)}
                className={`radial-slice ${selectedValue === v ? "slice-active" : ""}`}
               >
                <path
                  d={ringPath(i, innerRadius, coreRadius, innerStep)}
                  fill="#141414"
                  stroke="#330000"
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill="#ff4d4d"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* OUTER RING (1–20) */}
          {outer.map((v, i) => {
            const label = labelPos(i, outerStep, innerRadius, outerRadius);

            return (
              <g
                key={v}
                onClick={() => select(v)}
                className={`radial-slice ${selectedValue === v ? "slice-active" : ""}`}
               >
                <path
                  d={ringPath(i, outerRadius, innerRadius, outerStep)}
                  fill="#1a1a1a"
                  stroke="#440000"
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill="#f5f5f5"
                  fontSize="13"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {v}
                </text>
              </g>
            );
          })}
        </svg>

        <button
          className="radial-close"
          onClick={() => {
            if(closing) return;

            setClosing(true);
            setTimeout(() => onCancel(), 180);
          }}
        >
        </button>
      </div>
    </div>
  );
}