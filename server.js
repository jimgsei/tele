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
    // Verificar si ya tenemos los canales almacenados
    const channelsPath = path.join(__dirname, 'channels.json');
    if (fs.existsSync(channelsPath)) {
      const channelsData = fs.readFileSync(channelsPath, 'utf-8');
      return res.json(JSON.parse(channelsData));
    }

    // Si no los tenemos almacenados, los obtenemos de Vavoo
    const mainUrl = 'https://vavoo.to/channels';
    const proxyUrlForChannels = 'https://api.codetabs.com/v1/proxy/?quest=';
    const response = await fetch(proxyUrlForChannels + mainUrl);
    const data = await response.json();

    // Filtrar canales de España con los nombres específicos
    const channels = [];
    for (const item of data) {
      const { country, name, id } = item;
      const channelUrl = `https://oha.to/play/${id}/index.m3u8`;

      if (country === 'Spain' && 
          (name.toLowerCase().includes('caza') || 
           name.toLowerCase().includes('toros') || 
           name.toLowerCase().includes('onetoro') || 
           name.toLowerCase().includes('torole') || 
           name.toLowerCase().includes('iberlia tv'))) {
        
        // Llamada al servidor de OHA para obtener la URL real (evitar CORS)
        try {
          const resolvedUrl = await fetch(channelUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': '*/*',
              'Connection': 'keep-alive'
            }
          });

          // Si el enlace redirige correctamente, obtendremos la URL final
          const locationUrl = resolvedUrl.url; // La URL final después de la redirección
          
          // Añadimos la URL del canal
          channels.push({
            name: item.name,
            url: locationUrl
          });

        } catch (error) {
          console.error(`Error al obtener el canal ${name}:`, error);
        }
      }
    }

    // Almacenar los canales en un archivo JSON
    fs.writeFileSync(channelsPath, JSON.stringify(channels));

    // Devolver la lista de canales con la URL de los streams
    res.json(channels);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los canales');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
