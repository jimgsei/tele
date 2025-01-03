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
    const channels = await Promise.all(data.map(async (item) => {
      const { country, name, id } = item;
      if (country === 'Spain' && 
          (name.toLowerCase().includes('caza') || 
           name.toLowerCase().includes('toros') || 
           name.toLowerCase().includes('onetoro') || 
           name.toLowerCase().includes('torole') || 
           name.toLowerCase().includes('iberlia tv'))) {

        // Generar la URL para la solicitud de redirección de oha.to
        const channelUrl = `https://oha.to/play/${id}/index.m3u8`;

        // Resolver la URL para obtener la URL larga y completa (redirección)
        const resolvedUrl = await resolveRedirect(channelUrl);
        
        // Hacer una segunda solicitud a la URL final para obtener la 'url2'
        const finalUrl = await resolveRedirect(resolvedUrl);
        
        return {
          name: name,
          initialUrl: channelUrl,   // La URL inicial
          resolvedUrl: resolvedUrl, // La URL final (después de la primera redirección)
          url2: finalUrl            // La URL final después de la segunda redirección
        };
      }
    }));

    // Filtrar los canales que se hayan resuelto correctamente
    const validChannels = channels.filter(channel => channel != null);

    // Almacenar los canales en un archivo JSON
    fs.writeFileSync(channelsPath, JSON.stringify(validChannels));

    // Devolver la lista de canales
    res.json(validChannels);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los canales');
  }
});

// Función para resolver la URL de oha.to y obtener el enlace largo
async function resolveRedirect(url) {
  try {
    // Realiza la solicitud GET a la URL inicial
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });

    // La URL final tras la redirección es la que necesitamos
    return response.url;  // Esto devuelve la URL larga y final después de seguir la redirección
  } catch (error) {
    console.error('Error al resolver la redirección:', error);
    return url; // En caso de error, devolver la URL original
  }
}

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
