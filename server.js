const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta para manejar tus solicitudes
app.get('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        // Aquí puedes agregar la lógica para manejar el proxy si es necesario
        // Si quieres hacer un proxy de otro recurso, podrías usar algo como axios o fetch
        const response = await fetch(targetUrl);
        const data = await response.text();
        res.send(data);
    } catch (error) {
        res.status(500).send('Error al procesar la solicitud');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
