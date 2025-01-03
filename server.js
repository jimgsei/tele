const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Para realizar las solicitudes
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta para obtener la lista de canales y resolver URLs
app.get('/channels', async (req, res) => {
  try {
    // Verificar si ya tenemos los canales almacenados
    const channelsPath = path.join(__dirname, 'channels.json');
    if (fs.existsSync(channelsPath)) {
      const channelsData = fs.readFileSync(channelsPath, 'utf-8');
      return res.json(JSON.parse(channelsData));
    }

    // Lista inicial de canales
    const initialChannels = [
      {
        name: "ONETORO (6)",
        initialUrl: "https://oha.to/play/1442267705/index.m3u8"
      },
      {
        name: "IBERLIA TV (1)",
        initialUrl: "https://oha.to/play/2193702924/index.m3u8"
      },
      {
        name: "TOROS (6)",
        initialUrl: "https://oha.to/play/142832720/index.m3u8"
      },
      // Agrega más canales según sea necesario
    ];

    // Resolver las URLs para obtener las URL2
    const channels = await Promise.all(initialChannels.map(async (channel) => {
      const { name, initialUrl } = channel;

      // Resolver la URL que devuelve el servidor
      const resolvedUrl = await resolveRedirect(initialUrl);

      return {
        name,
        initialUrl,
        url2: resolvedUrl
      };
    }));

    // Almacenar las URLs resueltas
    fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2));

    // Devolver la lista de canales con URL2
    res.json(channels);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar los canales');
  }
});

// Función para resolver la redirección
async function resolveRedirect(url) {
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });

    // Devuelve la URL final después de las redirecciones
    return response.url;
  } catch (error) {
    console.error(`Error al resolver URL: ${url}`, error);
    return null; // Devuelve null si hay un problema
  }
}

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
