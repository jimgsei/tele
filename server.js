const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// URL del servidor local
const serverUrl = 'http://localhost:3000/channels';

// Ruta donde guardaremos los datos
const outputPath = path.join(__dirname, 'channels_with_m3u8.json');

async function fetchAndSaveChannels() {
  try {
    // Hacer la solicitud al servidor
    const response = await fetch(serverUrl);
    if (!response.ok) {
      throw new Error(`Error al obtener canales: ${response.statusText}`);
    }

    // Obtener la lista de canales
    const channels = await response.json();

    // Crear un array para guardar los resultados con los enlaces .m3u8
    const channelsWithUrls = [];

    for (const channel of channels) {
      const { name, url } = channel;

      // Hacer una solicitud al enlace del canal para asegurarnos de que es accesible
      try {
        const m3u8Response = await fetch(url);
        if (!m3u8Response.ok) {
          console.warn(`No se pudo acceder al enlace ${url}`);
          continue;
        }

        // Guardar el canal con su enlace verificado
        channelsWithUrls.push({ name, url });
      } catch (fetchError) {
        console.error(`Error al acceder al enlace ${url}: ${fetchError.message}`);
      }
    }

    // Guardar los resultados en un archivo JSON
    fs.writeFileSync(outputPath, JSON.stringify(channelsWithUrls, null, 2));
    console.log(`Canales guardados en ${outputPath}`);
  } catch (error) {
    console.error(`Error general: ${error.message}`);
  }
}

// Ejecutar la función
fetchAndSaveChannels();
