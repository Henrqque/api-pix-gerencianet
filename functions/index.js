if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const GNRequest = require('./src/apis/gerencianet');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const reqGNAlready = GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
});


app.get('/', async(req, res) => {
    const reqGN = await reqGNAlready;
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

    const cobResponse = await reqGN.post('v2/cob', dataCob);
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`, dataCob);

    res.send(qrcodeResponse.data)
})

app.get('/webhook(/pix)?', (req, res) => {
    console.log(req.body);
    res.send(200)
})

app.listen(8000, () => console.log('server running'))
