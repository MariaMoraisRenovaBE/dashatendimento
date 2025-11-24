import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function TemposMedios({ data }) {
  const { tempoMedio, evolucaoDiaria } = data

  // Preparar dados para mini-gráfico (últimos 7 dias)
  const ultimos7Dias = evolucaoDiaria.slice(-7)
  const trendData = {
    labels: ultimos7Dias.map(item => {
      const date = new Date(item.data)
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }),
    datasets: [{
      data: ultimos7Dias.map(item => parseFloat(item.tempo_medio_humano_minutos) || 0),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: 'rgb(16, 185, 129)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  }

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toFixed(2)} min`
          }
        }
      }
    },
    scales: {
      y: {
        display: false
      },
      x: {
        display: false
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-1.5 h-10 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
          Tempo Médio de Atendimento Humano
        </h2>
        <p className="text-gray-500 text-sm mt-1 ml-4">Métrica principal de performance</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 via-emerald-50/30 to-white rounded-3xl border-2 border-green-200/50 shadow-2xl p-10 relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-100/20 to-emerald-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Número Gigante */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Tempo Médio</p>
                <p className="text-7xl md:text-8xl font-extrabold text-green-600 mb-2 leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {tempoMedio.humano.formato}
                </p>
                <p className="text-base text-gray-500">Formato HH:mm:ss</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-green-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Em minutos</p>
                  <p className="text-3xl font-bold text-gray-900">{parseFloat(tempoMedio.humano.minutos).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">minutos</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-green-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total de registros</p>
                  <p className="text-3xl font-bold text-gray-900">{tempoMedio.humano.total.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-500 mt-1">protocolos</p>
                </div>
              </div>
            </div>

            {/* Mini Gráfico de Tendência */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Tendência (7 dias)</p>
                  <p className="text-xs text-gray-500">Evolução do tempo médio</p>
                </div>
                <div className="h-32">
                  <Line data={trendData} options={trendOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

