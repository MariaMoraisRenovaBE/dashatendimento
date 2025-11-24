import { useState, useEffect } from 'react'
import axios from 'axios'
import KPICards from './KPICards'
import TemposMedios from './TemposMedios'
import Graficos from './Graficos'
import VisaoRapida from './VisaoRapida'
import LoadingSpinner from './LoadingSpinner'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [graficos, setGraficos] = useState(null)
  const [tempos, setTempos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [kpisRes, graficosRes, temposRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/protocolos/kpis`),
          axios.get(`${API_BASE_URL}/api/protocolos/graficos`),
          axios.get(`${API_BASE_URL}/api/protocolos/tempos`)
        ])

        setKpis(kpisRes.data)
        setGraficos(graficosRes.data)
        setTempos(temposRes.data)
        setLoading(false)
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
        setError('Erro ao carregar dados do dashboard')
        setLoading(false)
      }
    }

    fetchData()
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header Premium */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Dashboard de Protocolos
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Análise completa de atendimentos e métricas em tempo real
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl px-4 py-2.5 shadow-md">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-sm font-semibold text-gray-700">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Visão Rápida */}
        {kpis && tempos && (
          <section className="animate-fade-in">
            <VisaoRapida kpis={kpis} tempos={tempos} />
          </section>
        )}

        {/* Tempos Médios - DESTAQUE MÁXIMO */}
        {tempos && (
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <TemposMedios data={tempos} />
          </section>
        )}

        {/* Comparação Bot vs Humano */}
        {kpis && (
          <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-10 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-600 rounded-full"></span>
                Comparação Bot vs Humano
              </h2>
              <p className="text-gray-500 text-sm mt-1 ml-4">Distribuição percentual de atendimentos</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bot */}
                <div className="bg-gradient-to-br from-purple-50 via-purple-50/50 to-white rounded-2xl p-8 border border-purple-100 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Atendimento Bot</h3>
                        <p className="text-sm text-gray-500">{kpis.tipoAtendimento.bot.toLocaleString('pt-BR')} protocolos</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                        {kpis.total > 0 ? ((kpis.tipoAtendimento.bot / kpis.total) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-sm text-gray-500">do total de atendimentos</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                        style={{ width: `${kpis.total > 0 ? ((kpis.tipoAtendimento.bot / kpis.total) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Humano */}
                <div className="bg-gradient-to-br from-green-50 via-emerald-50/50 to-white rounded-2xl p-8 border border-green-100 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Atendimento Humano</h3>
                        <p className="text-sm text-gray-500">{kpis.tipoAtendimento.humano.toLocaleString('pt-BR')} protocolos</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-6xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        {kpis.total > 0 ? ((kpis.tipoAtendimento.humano / kpis.total) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-sm text-gray-500">do total de atendimentos</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                        style={{ width: `${kpis.total > 0 ? ((kpis.tipoAtendimento.humano / kpis.total) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* KPIs Principais */}
        {kpis && (
          <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                Métricas Principais
              </h2>
              <p className="text-gray-500 text-sm mt-1 ml-4">Indicadores-chave de performance</p>
            </div>
            <KPICards data={kpis} />
          </section>
        )}

        {/* Gráficos */}
        {graficos && tempos && (
          <section className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-10 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></span>
                Análises Gráficas
              </h2>
              <p className="text-gray-500 text-sm mt-1 ml-4">Visualizações interativas e detalhadas</p>
            </div>
            <Graficos graficosData={graficos} temposData={tempos} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Dashboard atualizado automaticamente a cada 30 segundos
            </p>
            <p className="text-xs">© {new Date().getFullYear()} Dashboard de Protocolos</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

