type UnitStatLineProps = {
  currentHp: number;
  maxHp: number;
  ac: number;
};

export function UnitStatLine({
  currentHp,
  maxHp,
  ac,
}: UnitStatLineProps) {
  return (
    <span className="unit-stat-line">
      HP {currentHp}/{maxHp} | AC {ac}
    </span>
  );
}