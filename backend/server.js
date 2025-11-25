// backend/server.js

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());

// conexão com MySQL
const db = await mysql.createPool({
  host: '159.223.198.198',
  user: 'hdjtshheus',
  password: 'WqVVHuAW55',
  database: 'hdjtshheus',
  waitForConnections: true,
  connectionLimit: 10
});

console.log('✅ Conectado ao MySQL');

// MÉTRICAS PRINCIPAIS
app.get('/metrics', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN tipo_atendimento = 'bot' THEN 1 ELSE 0 END) AS bot,
        SUM(CASE WHEN tipo_atendimento = 'humano' THEN 1 ELSE 0 END) AS humano
      FROM protocolos;
    `);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar métricas.');
  }
});

// STATUS (adicional, para o dashboard atual)
app.get('/status', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT status, COUNT(*) AS total
      FROM protocolos
      GROUP BY status;
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar status.');
  }
});

// CANAIS
app.get('/channels', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT canal, COUNT(*) AS total
      FROM protocolos
      GROUP BY canal;
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar canais.');
  }
});

// TEMPOS MÉDIOS
app.get('/avg-time', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        SEC_TO_TIME(AVG(TIMESTAMPDIFF(SECOND, inicio_atendimento, fim_atendimento))) AS tempo_medio,
        AVG(TIMESTAMPDIFF(SECOND, inicio_atendimento, fim_atendimento)) AS tempo_medio_segundos
      FROM protocolos
      WHERE fim_atendimento IS NOT NULL;
    `);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar tempo médio.');
  }
});

// ÚLTIMOS ATENDIMENTOS
app.get('/last', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, canal, tipo_atendimento, inicio_atendimento, fim_atendimento
      FROM protocolos
      ORDER BY id DESC
      LIMIT 20;
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar últimos registros.');
  }
});

app.listen(3001, () => console.log('🚀 API rodando porta 3001'));

