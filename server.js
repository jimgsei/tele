const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Para realizar solicitudes a otros servidores

const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta del proxy
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url; // Obtener la URL desde los parámetros de la solicitud

  if (!targetUrl) {
    return res.status(400).send('Se requiere un parámetro de URL');
  }

  try {
    // Realizar la solicitud GET al URL de destino
    const response = await fetch(targetUrl);
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      return res.status(response.status).send('Error al obtener la URL');
    }

    // Enviar el contenido recibido desde el servidor de destino
    const data = await response.text(); // Puedes cambiarlo a .json() si esperas JSON
    res.send(data);

  } catch (error) {
    // Manejo de errores
    res.status(500).send('Error al procesar la solicitud: ' + error.message);
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
