import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do banco de dados (com valores padrão)
const dbConfig = {
  host: process.env.DB_HOST || '159.223.198.198',
  database: process.env.DB_DATABASE || 'hdjtshheus',
  user: process.env.DB_USER || 'hdjtshheus',
  password: process.env.DB_PASSWORD || 'WqVVHuAW55',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

// Teste de conexão
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado ao MySQL com sucesso!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MySQL:', err);
  });

// ==================== ROTAS ====================

// GET /api/protocolos/kpis
app.get('/api/protocolos/kpis', async (req, res) => {
  try {
    // Total de protocolos
    const [totalResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM protocolos'
    );
    const total = totalResult[0].total;

    // Total por tipo_atendimento
    const [tipoResult] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN tipo_atendimento = 'bot' THEN 1 ELSE 0 END) as bot,
        SUM(CASE WHEN tipo_atendimento = 'humano' THEN 1 ELSE 0 END) as humano
      FROM protocolos`
    );

    // Total por status
    const [statusResult] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as quantidade
      FROM protocolos
      GROUP BY status`
    );

    // Total por canal
    const [canalResult] = await pool.execute(
      `SELECT 
        canal,
        COUNT(*) as quantidade
      FROM protocolos
      WHERE canal IS NOT NULL AND canal != ''
      GROUP BY canal`
    );

    // Formatar status
    const statusMap = {};
    statusResult.forEach(row => {
      statusMap[row.status] = row.quantidade;
    });

    // Formatar canais
    const canalMap = {};
    canalResult.forEach(row => {
      canalMap[row.canal] = row.quantidade;
    });

    res.json({
      total: total,
      tipoAtendimento: {
        bot: tipoResult[0].bot || 0,
        humano: tipoResult[0].humano || 0
      },
      status: {
        aberto: statusMap['aberto'] || 0,
        em_atendimento: statusMap['em_atendimento'] || 0,
        pendente_cliente: statusMap['pendente_cliente'] || 0,
        resolvido: statusMap['resolvido'] || 0,
        fechado: statusMap['fechado'] || 0,
        cancelado: statusMap['cancelado'] || 0
      },
      canal: canalMap
    });
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ error: 'Erro ao buscar KPIs', details: error.message });
  }
});

// GET /api/protocolos/graficos
app.get('/api/protocolos/graficos', async (req, res) => {
  try {
    // Dados para gráfico de barras - Quantidade por status
    const [statusData] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as quantidade
      FROM protocolos
      GROUP BY status
      ORDER BY quantidade DESC`
    );

    // Dados para gráfico de pizza - Distribuição por canal
    const [canalData] = await pool.execute(
      `SELECT 
        COALESCE(canal, 'Não informado') as canal,
        COUNT(*) as quantidade
      FROM protocolos
      GROUP BY canal
      ORDER BY quantidade DESC`
    );

    // Dados para gráfico de colunas - Bot vs Humano
    const [tipoData] = await pool.execute(
      `SELECT 
        COALESCE(tipo_atendimento, 'Não informado') as tipo,
        COUNT(*) as quantidade
      FROM protocolos
      GROUP BY tipo_atendimento
      ORDER BY quantidade DESC`
    );

    res.json({
      status: statusData,
      canal: canalData,
      tipoAtendimento: tipoData
    });
  } catch (error) {
    console.error('Erro ao buscar dados para gráficos:', error);
    res.status(500).json({ error: 'Erro ao buscar dados para gráficos', details: error.message });
  }
});

// GET /api/protocolos/tempos
app.get('/api/protocolos/tempos', async (req, res) => {
  try {
    // Tempo médio humano (em segundos)
    const [tempoHumanoResult] = await pool.execute(
      `SELECT 
        AVG(TIMESTAMPDIFF(SECOND, inicio_atendimento_humano, final_atendimento_humano)) as tempo_medio_segundos,
        COUNT(*) as total
      FROM protocolos
      WHERE inicio_atendimento_humano IS NOT NULL 
        AND final_atendimento_humano IS NOT NULL
        AND tipo_atendimento = 'humano'`
    );

    // Tempo médio bot (em segundos)
    const [tempoBotResult] = await pool.execute(
      `SELECT 
        AVG(TIMESTAMPDIFF(SECOND, inicio_atendimento_bot, final_atendimento_bot)) as tempo_medio_segundos,
        COUNT(*) as total
      FROM protocolos
      WHERE inicio_atendimento_bot IS NOT NULL 
        AND final_atendimento_bot IS NOT NULL
        AND tipo_atendimento = 'bot'`
    );

    // Evolução diária dos tempos (últimos 30 dias)
    const [evolucaoDiaria] = await pool.execute(
      `SELECT 
        DATE(criado_em) as data,
        AVG(CASE 
          WHEN tipo_atendimento = 'humano' 
            AND inicio_atendimento_humano IS NOT NULL 
            AND final_atendimento_humano IS NOT NULL
          THEN TIMESTAMPDIFF(SECOND, inicio_atendimento_humano, final_atendimento_humano)
          ELSE NULL
        END) as tempo_medio_humano_segundos,
        AVG(CASE 
          WHEN tipo_atendimento = 'bot' 
            AND inicio_atendimento_bot IS NOT NULL 
            AND final_atendimento_bot IS NOT NULL
          THEN TIMESTAMPDIFF(SECOND, inicio_atendimento_bot, final_atendimento_bot)
          ELSE NULL
        END) as tempo_medio_bot_segundos
      FROM protocolos
      WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(criado_em)
      ORDER BY data ASC`
    );

    // Converter segundos para minutos e formato HH:mm:ss
    const formatarTempo = (segundos) => {
      if (!segundos || segundos === 0) return { minutos: 0, formato: '00:00:00' };
      
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segs = Math.floor(segundos % 60);
      
      return {
        minutos: (segundos / 60).toFixed(2),
        formato: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
      };
    };

    const tempoHumano = formatarTempo(tempoHumanoResult[0]?.tempo_medio_segundos || 0);
    const tempoBot = formatarTempo(tempoBotResult[0]?.tempo_medio_segundos || 0);

    // Formatar evolução diária
    const evolucaoFormatada = evolucaoDiaria.map(row => ({
      data: row.data,
      tempo_medio_humano_minutos: row.tempo_medio_humano_segundos ? (row.tempo_medio_humano_segundos / 60).toFixed(2) : 0,
      tempo_medio_bot_minutos: row.tempo_medio_bot_segundos ? (row.tempo_medio_bot_segundos / 60).toFixed(2) : 0
    }));

    res.json({
      tempoMedio: {
        humano: {
          segundos: tempoHumanoResult[0]?.tempo_medio_segundos || 0,
          minutos: tempoHumano.minutos,
          formato: tempoHumano.formato,
          total: tempoHumanoResult[0]?.total || 0
        },
        bot: {
          segundos: tempoBotResult[0]?.tempo_medio_segundos || 0,
          minutos: tempoBot.minutos,
          formato: tempoBot.formato,
          total: tempoBotResult[0]?.total || 0
        }
      },
      evolucaoDiaria: evolucaoFormatada
    });
  } catch (error) {
    console.error('Erro ao buscar tempos:', error);
    res.status(500).json({ error: 'Erro ao buscar tempos', details: error.message });
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}`);
});

