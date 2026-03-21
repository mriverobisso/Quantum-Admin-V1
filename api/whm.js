export default async function handler(req, res) {
  // CORS Headers allowing client side access from within the app
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { VITE_WHM_URL, WHM_API_TOKEN } = process.env;

  if (!VITE_WHM_URL || !WHM_API_TOKEN) {
    return res.status(500).json({ error: 'Faltan credenciales VITE_WHM_URL o WHM_API_TOKEN en las variables de entorno de Vercel.' });
  }

  try {
    // Format WHM URL ensuring no trailing slash
    const url = `${VITE_WHM_URL.replace(/\/$/, '')}/json-api/listaccts?api.version=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `whm root:${WHM_API_TOKEN}` // Requires root or appropriately privileged reseller token
      }
    });

    if (!response.ok) {
      throw new Error(`Error remoto (WHM): ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('WHM API Error:', error);
    return res.status(500).json({ error: error.message || 'Error desconocido conectando a WHM' });
  }
}
