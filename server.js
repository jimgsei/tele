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
    let channels = [];
    if (fs.existsSync(channelsPath)) {
      const channelsData = fs.readFileSync(channelsPath, 'utf-8');
      channels = JSON.parse(channelsData);
    }

    // Si no tenemos los canales almacenados, los obtenemos de Vavoo
    if (channels.length === 0) {
      const mainUrl = 'https://vavoo.to/channels';
      const proxyUrlForChannels = 'https://api.codetabs.com/v1/proxy/?quest=';
      const response = await fetch(proxyUrlForChannels + mainUrl);
      const data = await response.json();

      // Filtrar canales de España con los nombres específicos
      channels = [];
      for (const item of data) {
        const { country, name, id } = item;
        const channelUrl = `https://oha.to/play/${id}/index.m3u8`;

        if (country === 'Spain' && 
            (name.toLowerCase().includes('caza') || 
             name.toLowerCase().includes('toros') || 
             name.toLowerCase().includes('onetoro') || 
             name.toLowerCase().includes('torole') || 
             name.toLowerCase().includes('iberlia tv'))) {
          channels.push({ name, url: channelUrl });
        }
      }

      // Almacenar los canales en un archivo JSON
      fs.writeFileSync(channelsPath, JSON.stringify(channels));
    }

    // Realizar la solicitud a todas las URLs y mostrar los resultados
    const results = await Promise.all(channels.map(async (channel) => {
      const resolvedUrl = await resolveUrl(channel.url);  // Aquí es donde obtenemos la URL real
      return {
        name: channel.name,
        originalUrl: channel.url,
        resolvedUrl,  // Aquí está la URL final tras la redirección
      };
    }));

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los canales');
  }
});

// Función para resolver la URL real (obteniendo la URL final después de redirecciones)
async function resolveUrl(url) {
  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
      redirect: 'manual', // No seguir automáticamente, manejaremos las redirecciones manualmente
    });

    // Aquí verificamos si hay una redirección
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location'); // Obtener el nuevo enlace de redirección
      console.log(`Redirigiendo a: ${location}`);
      return await resolveUrl(location); // Hacer la recursión hasta resolver la URL final
    }

    return response.url; // Si no hay redirección, retornamos la URL original

  } catch (error) {
    console.error(`Error al resolver la URL: ${url}`, error);
    return null; // Si ocurre un error, retornamos null
  }
}

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
