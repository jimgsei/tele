const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Para realizar las solicitudes
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta proxy para redirigir solicitudes y evitar problemas de CORS
app.get('/proxy', async (req, res) => {
  const url = req.query.url; // Obtener la URL de la query string
  if (!url) {
    return res.status(400).send('La URL es requerida');
  }

  try {
    // Realizar la solicitud a la URL de destino
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Origin': req.headers.origin || 'null', // Pasar la cabecera Origin si está presente
      },
      redirect: 'follow', // Configurar para seguir automáticamente las redirecciones
    });

    // Enviar la respuesta final al cliente
    const data = await response.text(); // Puedes usar .json() si esperas una respuesta JSON
    res.send(data);

  } catch (error) {
    console.error(`Error al realizar la solicitud proxy: ${url}`, error);
    res.status(500).send('Error al realizar la solicitud proxy');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${port}`);
});
