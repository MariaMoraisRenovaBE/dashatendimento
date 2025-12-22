export default function StatBox({ title, value, subtitle, icon, color = "blue" }) {
  const colorClasses = {
    blue: {
      bg: "from-[#ec4899] to-[#be185d]",
      shadow: "shadow-[#ec4899]/25",
      border: "border-[#ec4899]/30"
    },
    green: {
      bg: "from-[#ec4899] to-[#be185d]",
      shadow: "shadow-[#ec4899]/25",
      border: "border-[#ec4899]/30"
    },
    purple: {
      bg: "from-[#ec4899] to-[#be185d]",
      shadow: "shadow-[#ec4899]/25",
      border: "border-[#ec4899]/30"
    },
    cyan: {
      bg: "from-[#ec4899] to-[#be185d]",
      shadow: "shadow-[#ec4899]/25",
      border: "border-[#ec4899]/30"
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border-2 border-[#ec4899] shadow-lg hover:shadow-xl hover:border-[#be185d] transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">{title}</p>
          <p className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`w-16 h-16 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center shadow-lg ${colors.shadow} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

