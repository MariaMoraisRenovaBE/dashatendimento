import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Graficos({ graficosData, temposData }) {
  // Gráfico de Barras - Quantidade por Status
  const statusChartData = {
    labels: graficosData.status.map(item => {
      const labels = {
        aberto: 'Aberto',
        em_atendimento: 'Em Atendimento',
        pendente_cliente: 'Pendente Cliente',
        resolvido: 'Resolvido',
        fechado: 'Fechado',
        cancelado: 'Cancelado'
      }
      return labels[item.status] || item.status
    }),
    datasets: [{
      label: 'Quantidade',
      data: graficosData.status.map(item => item.quantidade),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(107, 114, 128, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(234, 179, 8)',
        'rgb(249, 115, 22)',
        'rgb(34, 197, 94)',
        'rgb(107, 114, 128)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  // Gráfico de Donut - Distribuição por Canal
  const canalChartData = {
    labels: graficosData.canal.map(item => {
      const labels = {
        site: 'Site',
        telefone: 'Telefone',
        whatsapp: 'WhatsApp',
        email: 'Email',
        app: 'App',
        outro: 'Outro',
        messenger: 'Messenger',
        instagram: 'Instagram',
        googlebm: 'Google Business',
        'Não informado': 'Não informado'
      }
      return labels[item.canal] || item.canal
    }),
    datasets: [{
      data: graficosData.canal.map(item => item.quantidade),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(107, 114, 128, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(219, 39, 119, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 10
    }]
  }

  // Gráfico de Colunas - Bot vs Humano
  const tipoChartData = {
    labels: graficosData.tipoAtendimento.map(item => {
      const labels = {
        bot: 'Bot',
        humano: 'Humano',
        'Não informado': 'Não informado'
      }
      return labels[item.tipo] || item.tipo
    }),
    datasets: [{
      label: 'Quantidade',
      data: graficosData.tipoAtendimento.map(item => item.quantidade),
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderColor: [
        'rgb(168, 85, 247)',
        'rgb(34, 197, 94)',
        'rgb(107, 114, 128)'
      ],
      borderWidth: 2,
      borderRadius: 8,
    }]
  }

  // Gráfico de Linha - Evolução dos Tempos (apenas Humano)
  const evolucaoChartData = {
    labels: temposData.evolucaoDiaria.map(item => {
      const date = new Date(item.data)
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }),
    datasets: [
      {
        label: 'Tempo Médio Humano (min)',
        data: temposData.evolucaoDiaria.map(item => parseFloat(item.tempo_medio_humano_minutos)),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        cornerRadius: 8,
        displayColors: true
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  }

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  }

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            return value.toFixed(1) + ' min'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Status */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quantidade por Status</h3>
          <div className="h-80">
            <Bar data={statusChartData} options={barOptions} />
          </div>
        </div>

        {/* Gráfico de Donut - Canal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Distribuição por Canal</h3>
          <div className="h-80">
            <Doughnut data={canalChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Colunas - Bot vs Humano */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Bot vs Humano</h3>
          <div className="h-80">
            <Bar data={tipoChartData} options={barOptions} />
          </div>
        </div>

        {/* Gráfico de Linha - Evolução dos Tempos */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Evolução do Tempo Médio Humano (Últimos 30 dias)</h3>
          <div className="h-80">
            <Line data={evolucaoChartData} options={lineOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

