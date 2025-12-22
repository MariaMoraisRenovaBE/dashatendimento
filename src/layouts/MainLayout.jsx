import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function MainLayout() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Top Bar - Barra superior escura */}
      <div className="bg-[#1a0f0f] border-b border-[#2a1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-1"></div>
      </div>
      
      {/* Header - Preto com logo Renova */}
      <header className="bg-black border-b-2 border-[#ec4899] shadow-lg sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src="https://i.ibb.co/8DJg05MN/2f593fdd-c4e5-4951-b119-2e2424ef57c7-1.png" 
                  alt="Logo Renova" 
                  className="h-12 md:h-16 w-auto"
                />
              </div>
            <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-1">
                Dashboard de Protocolos
              </h1>
                <p className="text-gray-300 text-sm md:text-base font-medium">
                Análise completa de atendimentos e métricas em tempo real
              </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-[#1a0f0f] border border-[#ec4899]/30 rounded-lg px-4 py-2.5">
                <div className="w-2.5 h-2.5 bg-[#ec4899] rounded-full animate-pulse shadow-lg shadow-pink-500/50"></div>
                <span className="text-sm font-semibold text-white">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-pink-200 bg-white/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#ec4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Dashboard de Protocolos
            </p>
            <p className="text-xs">© {new Date().getFullYear()} Dashboard de Protocolos</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

