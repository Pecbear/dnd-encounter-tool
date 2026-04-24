type UnitStatBlockProps = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

export function UnitStatBlock({
  str,
  dex,
  con,
  int,
  wis,
  cha,
}: UnitStatBlockProps) {
  return (
    <div className="unit-stat-block">
      <div className="stat-row">
        <span>STR {str}</span>
        <span>DEX {dex}</span>
        <span>CON {con}</span>
      </div>

      <div className="stat-row">
        <span>INT {int}</span>
        <span>WIS {wis}</span>
        <span>CHA {cha}</span>
      </div>
    </div>
  );
}