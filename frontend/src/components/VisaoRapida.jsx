import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function VisaoRapida({ kpis, tempos }) {
  if (!kpis || !tempos) return null

  const total = kpis.total
  const botTotal = kpis.tipoAtendimento.bot
  const humanoTotal = kpis.tipoAtendimento.humano
  const botPercent = total > 0 ? ((botTotal / total) * 100).toFixed(1) : 0
  const humanoPercent = total > 0 ? ((humanoTotal / total) * 100).toFixed(1) : 0

  const chartData = {
    labels: ['Bot', 'Humano'],
    datasets: [{
      data: [botTotal, humanoTotal],
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
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Visão Rápida</h2>
          <p className="text-sm text-gray-500">Indicadores estratégicos em tempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Comparação Bot vs Humano */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-gray-100 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Distribuição de Atendimentos</h3>
          
          <div className="flex items-center gap-6">
            {/* Gráfico Donut */}
            <div className="w-32 h-32 flex-shrink-0 relative flex items-center justify-center">
              <div className="absolute inset-0">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-xs font-medium text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{total.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Comparação Visual */}
            <div className="flex-1 space-y-4">
              {/* Bot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-semibold text-gray-700">Bot</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{botPercent}%</p>
                    <p className="text-xs text-gray-500">{botTotal.toLocaleString('pt-BR')} protocolos</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${botPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Humano */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-gray-700">Humano</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{humanoPercent}%</p>
                    <p className="text-xs text-gray-500">{humanoTotal.toLocaleString('pt-BR')} protocolos</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                    style={{ width: `${humanoPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total de Protocolos */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-indigo-100 uppercase tracking-wider">Total</p>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold mb-1">{total.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-indigo-100">Protocolos</p>
        </div>

        {/* Tempo Médio Humano */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-green-100 uppercase tracking-wider">Tempo Médio</p>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{tempos.tempoMedio.humano.formato}</p>
          <p className="text-sm text-green-100">Atendimento Humano</p>
        </div>
      </div>
    </div>
  )
}

