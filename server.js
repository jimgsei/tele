const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Para realizar las solicitudes
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta para obtener la lista de canales
app.get('/channels', async (req, res) => {
  try {
    const channelsPath = path.join(__dirname, 'channels.json');
    const detailedChannelsPath = path.join(__dirname, 'detailed_channels.json');

    // Verificar si ya tenemos los canales almacenados
    if (fs.existsSync(channelsPath)) {
      const channelsData = fs.readFileSync(channelsPath, 'utf-8');
      const detailedChannelsData = fs.existsSync(detailedChannelsPath)
        ? JSON.parse(fs.readFileSync(detailedChannelsPath, 'utf-8'))
        : [];

      return res.json({ channels: JSON.parse(channelsData), detailed: detailedChannelsData });
    }

    // Obtener canales de Vavoo
    const mainUrl = 'https://vavoo.to/channels';
    const proxyUrlForChannels = 'https://api.codetabs.com/v1/proxy/?quest=';
    const response = await fetch(proxyUrlForChannels + mainUrl);
    const data = await response.json();

    // Filtrar canales de España con los nombres específicos
    const channels = data.filter(item => {
      const { country, name, id } = item;
      return country === 'Spain' && 
             (name.toLowerCase().includes('caza') || 
              name.toLowerCase().includes('toros') || 
              name.toLowerCase().includes('onetoro') || 
              name.toLowerCase().includes('torole') || 
              name.toLowerCase().includes('iberlia tv'));
    }).map(item => ({
      name: item.name,
      url: `https://oha.to/play/${item.id}/index.m3u8`
    }));

    // Almacenar los canales en un archivo JSON
    fs.writeFileSync(channelsPath, JSON.stringify(channels));

    // Hacer llamadas a las URLs y guardar los resultados
    const detailedChannels = [];
    for (const channel of channels) {
      try {
        // Realizar la solicitud desde el servidor
        const m3u8Response = await fetch(channel.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
          },
        });

        // Obtener el contenido del enlace real
        const m3u8Link = await m3u8Response.text();
        detailedChannels.push({
          name: channel.name,
          url: channel.url,
          m3u8Link: m3u8Link.trim(), // Guardar el enlace o contenido devuelto
        });
      } catch (error) {
        console.error(`Error al llamar a ${channel.url}: ${error.message}`);
        detailedChannels.push({
          name: channel.name,
          url: channel.url,
          m3u8Link: null, // Guardar como null si no se puede obtener
        });
      }
    }

    // Guardar los resultados detallados en un archivo JSON
    fs.writeFileSync(detailedChannelsPath, JSON.stringify(detailedChannels, null, 2));

    // Devolver los resultados
    res.json({ channels, detailed: detailedChannels });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los canales');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
