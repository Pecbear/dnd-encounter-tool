type NumberRadialProps = {
  onSelect: (value: number) => void;
  onClose: () => void;
};

export function NumberRadial({ onSelect, onClose }: NumberRadialProps) {
  const numbers = [1, 2, 3, 4, 5, 6];

  const radius = 140;
  const center = 150;
  const step = (2 * Math.PI) / numbers.length;

  function polar(angle: number, r: number) {
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  function arcPath(i: number) {
    const start = i * step - Math.PI / 2;
    const end = start + step;

    const p1 = polar(start, radius);
    const p2 = polar(end, radius);

    return `
      M ${center} ${center}
      L ${p1.x} ${p1.y}
      A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}
      Z
    `;
  }

  function labelPos(i: number) {
    const angle = i * step + step / 2 - Math.PI / 2;
    const r = radius * 0.6;
    return polar(angle, r);
  }

  return (
    <div className="radial-backdrop">
      <div className="radial-wrap radial-in">
        <svg viewBox="0 0 300 300" className="radial-svg">
          {numbers.map((n, i) => {
            const pos = labelPos(i);

            return (
              <g
                key={n}
                className="radial-slice"
                onClick={() => onSelect(n)}
              >
                <path d={arcPath(i)} fill="#1a1a1a" stroke="#330000" />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="18"
                >
                  {n}
                </text>
              </g>
            );
          })}
        </svg>

        <button className="radial-close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}