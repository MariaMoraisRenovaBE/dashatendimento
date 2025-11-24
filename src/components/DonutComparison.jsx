import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function DonutComparison({ bot, humano, total }) {
  const botPercent = total > 0 ? ((bot / total) * 100).toFixed(1) : 0
  const humanoPercent = total > 0 ? ((humano / total) * 100).toFixed(1) : 0

  const chartData = {
    labels: ['Bot', 'Humano'],
    datasets: [{
      data: [bot, humano],
      backgroundColor: [
        'rgba(168, 85, 247, 0.9)',
        'rgba(16, 185, 129, 0.9)'
      ],
      borderColor: '#ffffff',
      borderWidth: 4,
      hoverOffset: 8
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    cutout: '70%'
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-100 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Distribuição de Atendimentos</h3>
      
      <div className="flex items-center gap-8">
        {/* Gráfico Donut */}
        <div className="w-40 h-40 flex-shrink-0 relative flex items-center justify-center">
          <div className="absolute inset-0">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div className="relative z-10 text-center">
            <p className="text-xs font-medium text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">{total.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Comparação Visual */}
        <div className="flex-1 space-y-6">
          {/* Bot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <span className="text-sm font-semibold text-gray-700">Bot</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-gray-900">{botPercent}%</p>
                <p className="text-xs text-gray-500">{bot.toLocaleString('pt-BR')} protocolos</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                style={{ width: `${botPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Humano */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold text-gray-700">Humano</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-gray-900">{humanoPercent}%</p>
                <p className="text-xs text-gray-500">{humano.toLocaleString('pt-BR')} protocolos</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                style={{ width: `${humanoPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

