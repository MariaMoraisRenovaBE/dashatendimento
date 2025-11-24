export default function ProgressBar({ percentage, color = "blue", className = "" }) {
  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
    green: "bg-gradient-to-r from-green-500 to-emerald-600",
    purple: "bg-gradient-to-r from-purple-500 to-purple-600",
    yellow: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    orange: "bg-gradient-to-r from-orange-500 to-orange-600",
    red: "bg-gradient-to-r from-red-500 to-red-600",
    gray: "bg-gradient-to-r from-gray-500 to-gray-600"
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div 
        className={`h-full ${colorClasses[color]} rounded-full transition-all duration-1000`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}

