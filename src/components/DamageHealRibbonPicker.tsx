import { useMemo, useState } from "react";
import "../App.css";

type Mode = "hit" | "heal" | "setHP";

type Props = {
  mode: Mode;
  targetName?: string;
  onConfirm: (value: number) => void;
  onCancel: () => void;
};

export function DamageHealRibbonPicker({
  mode,
  targetName,
  onConfirm,
  onCancel,
}: Props) {
  const [tens, setTens] = useState<number | null>(null);
  const [ones, setOnes] = useState<number | null>(null);

  const value = useMemo(() => {
    if (tens === null && ones === null) return null;
    
    const t = tens ?? 0;
    const o = ones ?? 0;

    // if only ones selected > treat as single digit
    if (tens === null) return o;

    return t * 10 + o;
  }, [tens, ones]);

  function reset() {
    setTens(null);
    setOnes(null);
  }

  function commit(finalValue: number) {
    onConfirm(finalValue);
    reset();
  }

  function handleLeft(n: number) {
    setTens(n);
  }

  function handleRight(n: number) {
    // if no tens selected → instant commit
    if (tens === null) {
        setOnes(null); //keep state clean
      commit(n);
      return;
    }

    setOnes(n);

    const final = tens * 10 + n;

    // small delay so UI flashes final value
    setTimeout(() => {
      commit(final);
    }, 80);
  }

  const label = mode === "hit" ? "HIT" : "HEAL";
  const colorClass = mode === "hit" ? "ribbon-hit" : "ribbon-heal";

  return (
    <div className="ribbon-backdrop" onClick={onCancel}>
      <div className={`ribbon-modal ${colorClass}`} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="ribbon-header">
          <div className="ribbon-title">{label}</div>
          <div className="ribbon-sub">{targetName ?? "No target"}</div>
        </div>

        {/* DISPLAY */}
        <div className="ribbon-display">
          {value ?? "_"}
        </div>

        {/* RIBBONS */}
        <div className="ribbon-grid">

          {/* LEFT (TENS) */}
          <div className="ribbon-column">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <button
                key={n}
                className={`ribbon-cell ${tens === n ? "active" : ""}`}
                onClick={() => handleLeft(n)}
              >
                {n}
              </button>
            ))}
          </div>

          {/* RIGHT (ONES) */}
          <div className="ribbon-column">
            {[0,1,2,3,4,5,6,7,8,9].map((n) => (
              <button
                key={n}
                className="ribbon-cell"
                onClick={() => handleRight(n)}
              >
                {n}
              </button>
            ))}
          </div>

        </div>

        {/* FOOTER */}
        <div className="ribbon-footer">
          <button className="btn util" onClick={() => { reset(); onCancel(); }}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}