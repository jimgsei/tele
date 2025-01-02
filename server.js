const express = require('express');
const cors = require('cors');
const request = require('request');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Proxy is running!');
});

app.get('/proxy', (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('URL is required');
    }

    request(
        { url, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } },
        (error, response, body) => {
            if (error) {
                return res.status(500).send(error.message);
            }
            res.set(response.headers);
            res.send(body);
        }
    );
});

app.listen(port, () => {
    console.log(`Proxy server running on port ${port}`);
});
