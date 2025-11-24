import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

export default function BarChart({ data, labels, title, colors }) {
  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Quantidade',
      data: data,
      backgroundColor: colors || [
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(107, 114, 128, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: colors?.map(c => c.replace('0.8', '1')) || [
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

  const options = {
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
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

