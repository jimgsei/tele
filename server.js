const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Si necesitas hacer solicitudes HTTP

const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta para manejar tus solicitudes de proxy (si necesitas hacer un proxy de otros servicios)
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url; // Obtener la URL de la solicitud
    if (!targetUrl) {
      return res.status(400).send('Se requiere una URL');
    }

    // Hacer una solicitud HTTP a la URL de destino usando fetch
    const response = await fetch(targetUrl);
    
    // Si la respuesta es exitosa
    if (!response.ok) {
      return res.status(response.status).send('Error al obtener la URL');
    }

    const data = await response.text(); // O puedes usar .json() si esperas JSON
    res.send(data); // Enviar el contenido obtenido
  } catch (error) {
    res.status(500).send('Error al procesar la solicitud: ' + error.message);
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

