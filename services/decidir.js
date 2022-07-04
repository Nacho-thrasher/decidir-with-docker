// const { DECIDIR_URL, DECIDIR_PRIVATE_KEY } = process.env;
const axios = require('axios');
const decidirUrl = `https://developers.decidir.com/api/v2/`
const decidirPrivateKey = `1b19bb47507c4a259ca22c12f78e881f`
const { consulta } = require('../index');
// const decidirPublicKey = `96e7f0d36a0648fb9a8dcb50ac06d260`
const getPagoDecidir = async(siteTransactionId) => {
    if (siteTransactionId == null || siteTransactionId.length == 0) {
        return null;     
    }
    try {
        siteTransactionId = siteTransactionId.replace(/%20/g, ' ');
        const payments = await axios.get(`${decidirUrl}payments`, {
            params: {
                'siteOperationId': siteTransactionId
            },
            headers: {
                'Content-Type': 'application/json',
                'apikey': decidirPrivateKey,
                'Cache-Control': 'no-cache'
            }
        })
        return payments.data.results;  

    } catch (error) {
        console.log(error);
        return null;
    }
}
const postPagoDecidir = async(paymentRequest, movim, amount, cuotas, siteId) => {
    if (paymentRequest == null || movim == null) return null;     
    //? con los datos del usuario se genero el pago
    console.log('llego a postPagoDecidir'); //? token es transaction_id
    try {
        const args = {
            "establishment_name": "UCASAL",
            "token": paymentRequest.token,
            "site_transaction_id": movim.NRO_TRANSAC,
            "payment_method_id": paymentRequest.paymentMethodId,
            "site_id": siteId, 
            "bin": paymentRequest.bin,
            "amount": amount,
            "currency": "ARS",
            "installments": cuotas,
            "payment_type": "single",
            "sub_payments": [] //? consultar aqui
        }
        //? se crea el pago en decidir
        const pago = await axios.post(`${decidirUrl}payments`, args, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': decidirPrivateKey,
                'Cache-Control': 'no-cache'
            }
        })
        return pago.data;

    } catch (error) {
        console.log(error);
        return null;
    }
}

const insertGesDecidir = async(args) => {

    let q = `INSERT INTO GES_DECIDIR 
    ( DESCRIPCION, 
    HABER, 
    COMISION, 
    MONTO_RECIBIDO, 
    NRO_TRANSAC, 
    TIPO_OPERACION, 
    ID_MEDIO_PAGO, 
    BIN, 
    ID_DECIDIR, 
    TICKET, 
    CANT_CUOTAS,
    INTERES, 
    MONTO_CON_INTERES,
    MONTO_X_CUOTA, 
    APP_ORIGEN)
    VALUES ('${args.descripcion}'
        ,${args.haber}
        ,${args.comision}
        ,${args.montoRecibido}
        ,'${args.nroTransac}'
        ,'${args.tipoOperacion}'
        ,${args.idMedioPago}
        ,'${args.bin}'
        ,'${args.idDecidir}'
        ,'${args.ticket}'
        ,${args.cantCuotas}
        ,${args.interes}
        ,${args.montoConInteres}
        ,${args.montoPorCuota}
        ,'${args.appOrigen}'
    )`;
    console.log(q);
    const result = await consulta(q);
    return result;

}

module.exports = { getPagoDecidir, postPagoDecidir, insertGesDecidir};