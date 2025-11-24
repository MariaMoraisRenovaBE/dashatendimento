// Formata segundos para formato legível (ex: "5m 30s")
export function formatSeconds(seconds) {
  if (!seconds || seconds === 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

// Formata segundos para formato HH:mm:ss
export function formatSecondsToTime(seconds) {
  if (!seconds || seconds === 0) return "00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Converte segundos para minutos (decimal)
export function secondsToMinutes(seconds) {
  if (!seconds) return 0;
  return (seconds / 60).toFixed(2);
}

