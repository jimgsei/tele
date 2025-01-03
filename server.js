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
    const channels = data.filter(item => {
      const { country, name, id } = item;
      const channelUrl = `https://oha.to/play/${id}/index.m3u8`;
      return country === 'Spain' && 
             (name.toLowerCase().includes('caza') || 
              name.toLowerCase().includes('toros') || 
              name.toLowerCase().includes('onetoro') || 
              name.toLowerCase().includes('torole') || 
              name.toLowerCase().includes('iberlia tv'));
    }).map(item => ({
      name: item.name,
      url: `https://vavoo.to/play/${item.id}/index.m3u8`
    }));

    // Almacenar los canales en un archivo JSON
    fs.writeFileSync(channelsPath, JSON.stringify(channels));

    // Devolver la lista de canales
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
