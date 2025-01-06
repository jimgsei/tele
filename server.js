const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Ruta proxy para redirigir solicitudes y evitar problemas de CORS
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('La URL es requerida');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
      redirect: 'follow',
    });

    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error(`Error al realizar la solicitud proxy: ${url}`, error);
    res.status(500).send('Error al realizar la solicitud proxy');
  }
});

app.listen(port, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${port}`);
});
