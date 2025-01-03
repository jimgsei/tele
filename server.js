const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Para hacer solicitudes HTTP

const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta para manejar las solicitudes de proxy
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url; // Obtener la URL desde los parámetros de la solicitud

  if (!targetUrl) {
    return res.status(400).send('Se requiere un parámetro de URL');
  }

  try {
    // Realizar la solicitud GET a la URL de destino, siguiendo las redirecciones
    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow' // Esto sigue las redirecciones hasta la URL final
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      return res.status(response.status).send('Error al obtener la URL');
    }

    // Obtener la URL final (redireccionada) después de seguir todas las redirecciones
    const finalUrl = response.url;

    // Enviar la URL final al cliente
    res.send(finalUrl);

  } catch (error) {
    // Manejo de errores
    res.status(500).send('Error al procesar la solicitud: ' + error.message);
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

