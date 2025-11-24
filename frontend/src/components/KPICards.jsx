export default function KPICards({ data }) {
  const statusLabels = {
    aberto: 'Aberto',
    em_atendimento: 'Em Atendimento',
    pendente_cliente: 'Pendente Cliente',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
    cancelado: 'Cancelado'
  }

  const statusColors = {
    aberto: 'border-blue-500 bg-blue-50',
    em_atendimento: 'border-yellow-500 bg-yellow-50',
    pendente_cliente: 'border-orange-500 bg-orange-50',
    resolvido: 'border-green-500 bg-green-50',
    fechado: 'border-gray-500 bg-gray-50',
    cancelado: 'border-red-500 bg-red-50'
  }

  const canalLabels = {
    site: 'Site',
    telefone: 'Telefone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    app: 'App',
    outro: 'Outro',
    messenger: 'Messenger',
    instagram: 'Instagram',
    googlebm: 'Google Business'
  }

  return (
    <div className="space-y-8">
      {/* KPIs Principais - Grid Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Total de Protocolos</p>
              <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">{data.total.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-400 font-medium">Registros totais</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Atendimento Bot</p>
              <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">{data.tipoAtendimento.bot.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-400 font-medium">
                {data.total > 0 ? ((data.tipoAtendimento.bot / data.total) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Atendimento Humano</p>
              <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">{data.tipoAtendimento.humano.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-400 font-medium">
                {data.total > 0 ? ((data.tipoAtendimento.humano / data.total) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Canais Ativos</p>
              <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">{Object.keys(data.canal).length}</p>
              <p className="text-xs text-gray-400 font-medium">Canais diferentes</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Status dos Protocolos */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Status dos Protocolos</h3>
            <p className="text-sm text-gray-500 mt-1">Distribuição por status atual</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(data.status).map(([key, value]) => {
            const percentage = data.total > 0 ? ((value / data.total) * 100).toFixed(1) : 0
            const colorMap = {
              aberto: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200', bar: 'from-blue-500 to-blue-600', text: 'text-blue-700' },
              em_atendimento: { bg: 'from-yellow-50 to-yellow-100/50', border: 'border-yellow-200', bar: 'from-yellow-500 to-yellow-600', text: 'text-yellow-700' },
              pendente_cliente: { bg: 'from-orange-50 to-orange-100/50', border: 'border-orange-200', bar: 'from-orange-500 to-orange-600', text: 'text-orange-700' },
              resolvido: { bg: 'from-green-50 to-green-100/50', border: 'border-green-200', bar: 'from-green-500 to-emerald-600', text: 'text-green-700' },
              fechado: { bg: 'from-gray-50 to-gray-100/50', border: 'border-gray-200', bar: 'from-gray-500 to-gray-600', text: 'text-gray-700' },
              cancelado: { bg: 'from-red-50 to-red-100/50', border: 'border-red-200', bar: 'from-red-500 to-red-600', text: 'text-red-700' }
            }
            const colors = colorMap[key] || colorMap.fechado
            return (
              <div key={key} className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-5 border ${colors.border} shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{statusLabels[key] || key}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mb-1">{value.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <div className={`w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md border ${colors.border}`}>
                      <span className={`text-2xl font-bold ${colors.text}`}>{percentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Distribuição por Canal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Distribuição por Canal</h3>
            <p className="text-sm text-gray-500">Canais de atendimento utilizados</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(data.canal).map(([key, value]) => {
            const percentage = data.total > 0 ? ((value / data.total) * 100).toFixed(1) : 0
            return (
              <div key={key} className="stat-card-premium border-l-4 border-cyan-500 bg-gradient-to-br from-cyan-50/50 to-white group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-1">{canalLabels[key] || key}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{value.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-500">{percentage}% do total</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

