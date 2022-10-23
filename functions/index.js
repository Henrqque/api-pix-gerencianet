if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();

// pegando o certificado //retorna em buffer
const cert = fs.readFileSync(
    path.resolve(__dirname, `./certs/${process.env.GN_CERT}`)
);

const agent = new https.Agent({
    pfx: cert,
    passphrase: ''
});

//token
const credentials = Buffer.from(
    `${process.env.GN_CLIENT_ID}:${process.env.GN_CLIENT_SECRET}`
).toString('base64');

app.get('/', async(req, res) => {
    const authResposne = await axios({
        method: 'POST',
        url: `${process.env.GN_ENDPOINT}/oauth/token`,
        headers:{
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: agent,
        data: {
            grant_type: 'client_credentials'
        }
    })
    const acessToken = authResposne.data?.access_token;

    const reqGN = axios.create({
        baseURL: process.env.GN_ENDPOINT,
        httpsAgent: agent,
        headers:{
            Authorization: `Bearer ${acessToken}`,
            'Content-Type': 'application/json'
        }
    })

    const dataCob = {
        calendario: {
            expiracao: 3600
        },
        valor: {
            original: "0.10"
        },
        chave: "2ce7dcd7-5eb3-4d20-b13d-908868a40659",
        solicitacaoPagador: "Cobrança dos serviços prestado"
    }

    const config = {
        httpsAgent: agent,
        headers:{
            Authorization: `Bearer ${acessToken}`,
            'Content-Type': 'application/json'
        }
    };

    const cobResponse = await reqGN.post('v2/cob', dataCob, config);
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`, dataCob, config);

    res.send(qrcodeResponse.data)
})

app.listen(8000, () => console.log('server running'))
