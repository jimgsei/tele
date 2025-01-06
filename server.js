const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(cors({ origin: true }));

app.get('/proxy-m3u8', async (req, res) => {
    const proxyUrl = 'https://api.codetabs.com/v1/proxy/?quest=';
    const mainUrl = 'https://vavoo.to/channels';
    try {
        const response = await fetch(proxyUrl + mainUrl);
        const mainData = await response.json();
        
        // Filtrar el contenido necesario
        const m3u8Content = mainData.map(item => {
            const { id, name } = item;
            const channelUrl = `https://vavoo.to/play/${id}/index.m3u8`;
            return `#EXTINF:-1, ${name}\n${channelUrl}`;
        }).join('\n');
        
        res.send(m3u8Content);
    } catch (error) {
        res.status(500).send('Error fetching M3U8 content');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
