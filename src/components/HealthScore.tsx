interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function HealthScore({ score, size = "md" }: Props) {
  const radius = size === "lg" ? 32 : size === "md" ? 24 : 16;
  const strokeWidth = size === "lg" ? 4 : 3;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "#22c55e"
      : score >= 60
      ? "#eab308"
      : score >= 40
      ? "#f97316"
      : "#ef4444";

  const svgSize = (radius + strokeWidth) * 2;
  const textSize =
    size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-xs";

  return (
    <div className="inline-flex items-center justify-center relative">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        aria-label={`Health score: ${score} out of 100`}
        role="img"
      >
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          className="health-ring transition-all duration-500"
          style={{ transform: `rotate(-90deg)`, transformOrigin: "center" }}
        />
      </svg>
      <span className={`absolute font-bold ${textSize}`} style={{ color }}>
        {score}
      </span>
    </div>
  );
}
