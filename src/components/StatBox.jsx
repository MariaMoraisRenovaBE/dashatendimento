export default function StatBox({ title, value, subtitle, icon, color = "blue" }) {
  const colorClasses = {
    blue: {
      bg: "from-indigo-500 to-indigo-600",
      shadow: "shadow-indigo-500/25"
    },
    green: {
      bg: "from-green-500 to-emerald-600",
      shadow: "shadow-green-500/25"
    },
    purple: {
      bg: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/25"
    },
    cyan: {
      bg: "from-cyan-500 to-blue-600",
      shadow: "shadow-cyan-500/25"
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
          <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
        </div>
        <div className={`w-16 h-16 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center shadow-lg ${colors.shadow} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

