if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const GNRequest = require('./src/apis/gerencianet');

const app = express();
app.use(bodyParser.json());

const reqGNAlready = GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
});

app.post('/', async(req, res) => {
    const reqGN = await reqGNAlready;
    const { fullname, expire, amount, cpf, user } = req.body;
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

    const data = {
        user: user,
        total: amount,
        qrcode_image: qrcodeResponse.data.qrcode,
        status: 'pending',
        txid: cobResponse.data.txid
    }

    res.send(data)
})

app.post('/webhook(/pix)?', async(req, res) => {
    console.log(req.body);
    const { pix } = req.body;
    try {
        await axios.post('https://us-central1-readeasydice.cloudfunctions.net/api/pix', {
            pix
        })

        return console.log('sucess')
    } catch (error) {
        console.log(error)
    }
    res.send(200)
})

app.listen(8000, () => console.log('server running'))
