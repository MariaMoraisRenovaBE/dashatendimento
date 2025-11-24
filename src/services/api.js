export async function getDashboardData() {
  const response = await fetch("https://phpstack-1358125-6012593.cloudwaysapps.com/api/dashboard/protocolos");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

