const { clientCredentials } = require("../shared/GNClientConnect");
const { isAfter, addHours } = require("date-fns");
const { getToken, GNRequest } = require("../apis/gerencianet");

const authData = getToken(clientCredentials);

let token;
let create;

class QrCodeService {
  static async execute({ amount, cpf, fullname, expire }) {
    const { accessToken, createdAt } = await authData;

    token = accessToken;
    create = createdAt;

    let compareData = addHours(create, 1);

    if (isAfter(Date.now(), compareData)) {
      let { accessToken, createdAt } = await getToken(clientCredentials);

      token = accessToken;
      create = createdAt;
    }

    const reqGN = await GNRequest(token);

    const dataCob = {
      calendario: {
        expiracao: expire,
      },
      devedor: {
        cpf: cpf,
        nome: fullname,
      },
      valor: {
        original: amount?.toFixed(2),
      },
      chave: "2ce7dcd7-5eb3-4d20-b13d-908868a40659",
      solicitacaoPagador: "ArcadeX.nl",
    };

    const cobResponse = await reqGN.post("/v2/cob", dataCob);
    const qrCodeResponse = await reqGN.get(
      `/v2/loc/${cobResponse.data.loc.id}/qrcode`
    );
    return { cob: cobResponse.data, qrcode: qrCodeResponse.data };
  }
}

module.exports = { QrCodeService };
