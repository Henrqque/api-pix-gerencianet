if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const GNRequest = require('./src/apis/gerencianet');
const bodyParser = require('body-parser');

admin.initializeApp();

const app = express();
app.use(bodyParser.json());

const reqGNAlready = GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
});


app.post('/', async(req, res) => {
    const { fullname, expire, amount, cpf } = req.body;
    const reqGN = await reqGNAlready;
    const dataCob = {
        calendario: {
            expiracao: expire
        },
        devedor: {
            cpf: cpf,
            nome: fullname
        },
        valor: {
            original: amount.toFixed(2)
        },
        chave: "2ce7dcd7-5eb3-4d20-b13d-908868a40659",
        solicitacaoPagador: "Cobrança dos serviços prestado"
    }

    const cobResponse = await reqGN.post('v2/cob', dataCob);
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`, dataCob);

    res.send(qrcodeResponse.data)
})

app.post('/webhook(/pix)?', async(req, res) => {
    res.send(req.body);
})

app.listen(8000, () => console.log('server running'))

//exports.api = functions.https.onRequest(app);
