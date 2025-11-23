"use client";

interface CircularProgressProps {
  score: number;
  max?: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function CircularProgress({
  score,
  max = 10,
  label,
  size = 120,
  strokeWidth = 8,
  color = "#86A789",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / max) * circumference;
  const percentage = (score / max) * 100;

  const getColor = () => {
    if (percentage >= 80) return "#34C759"; // Green
    if (percentage >= 60) return "#FFD60A"; // Gold
    return "#FF3B30"; // Red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="progress-ring">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="progress-ring-circle"
            style={{
              filter: `drop-shadow(0 0 8px ${getColor()}40)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: getColor() }}>
              {score}
            </div>
            <div className="text-xs text-gray-500">{max > 1 ? `/ ${max}` : ""}</div>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div className="font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 mt-1">
          {getColor() === "#34C759"
            ? "Excellent"
            : getColor() === "#FFD60A"
            ? "Good"
            : "Needs Work"}
        </div>
      </div>
    </div>
  );
}
