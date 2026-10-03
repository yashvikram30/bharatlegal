const SPOKES = 24;

/**
 * 24-spoke wheel line-art. Each stroke uses pathLength=1 so the `.chakra-draw`
 * utility (globals.css) can draw it in once on load.
 */
export function Chakra({ className, still = false }: { className?: string; still?: boolean }) {
  const draw = still ? "" : "chakra-draw";
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle className={draw} pathLength={1} cx="200" cy="200" r="194" />
      <circle className={draw} pathLength={1} cx="200" cy="200" r="178" style={{ animationDelay: "0.15s" }} />
      <circle className={draw} pathLength={1} cx="200" cy="200" r="36" style={{ animationDelay: "0.3s" }} />
      {Array.from({ length: SPOKES }).map((_, i) => {
        const a = (i / SPOKES) * Math.PI * 2;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        return (
          <line
            key={i}
            className={draw}
            pathLength={1}
            x1={200 + cos * 36}
            y1={200 + sin * 36}
            x2={200 + cos * 178}
            y2={200 + sin * 178}
            style={{ animationDelay: `${0.35 + i * 0.045}s` }}
          />
        );
      })}
      {Array.from({ length: SPOKES }).map((_, i) => {
        // small arcs between spokes at the rim, like the Ashoka Chakra's inner notches
        const a = ((i + 0.5) / SPOKES) * Math.PI * 2;
        return (
          <circle
            key={`d${i}`}
            className={draw}
            pathLength={1}
            cx={200 + Math.cos(a) * 166}
            cy={200 + Math.sin(a) * 166}
            r="4"
            style={{ animationDelay: `${1 + i * 0.03}s` }}
          />
        );
      })}
    </svg>
  );
}
