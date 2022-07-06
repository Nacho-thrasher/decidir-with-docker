// http://www-desa.ucasal.edu.ar/inscripciones/
// const { DECIDIR_URL, DECIDIR_PRIVATE_KEY } = process.env;
const axios = require('axios');
const decidirUrl = `https://developers.decidir.com/api/v2/`
const decidirPrivateKey = `1b19bb47507c4a259ca22c12f78e881f`
const { consulta } = require('../index');

const getPagoDecidir = async(siteTransactionId) => {
    if (siteTransactionId == null || siteTransactionId.length == 0) return null;     
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
        return await payments.data.results;  

    } catch (error) {
        console.log(error);
        return null;
    }
}
const postPagoDecidir = async(paymentRequest, movim, amount, cuotas, siteId) => {
    if (paymentRequest == null || movim == null) return null;     
    try {
        const args = {
            "establishment_name": "UCASAL",
            "token": paymentRequest.token,
            "site_transaction_id": (movim.NRO_TRANSAC).toString(),
            // "site_id": (siteId).toString(), 
            "payment_method_id": paymentRequest.paymentMethodId,
            "bin": paymentRequest.bin,
            "amount": Number(amount),
            "currency": "ARS",
            "installments": cuotas,
            "payment_type": "single",
            "sub_payments": [] //? consultar aqui
        }
        //todo: se crea el pago en decidir
        const pago = await axios.post(`${decidirUrl}payments`, args, 
        {
            headers: {
                'Content-Type': 'application/json',
                'apikey': decidirPrivateKey,
                'cache-control': 'no-cache',
            }
        })
        return await pago.data;

    } catch (error) {
        console.log(error.response.data);
        return null;
    }
}

const insertGesDecidir = async(args) => {

    let q = `INSERT INTO GES_DECIDIR 
    (FEC_MOV, DESCRIPCION, HABER, COMISION, MONTO_RECIBIDO, NRO_COMP1, NRO_COMP2, NRO_OPERACION, NRO_TRANSAC, ID_MEDIO_PAGO, BIN, ID_DECIDIR, TICKET, CANT_CUOTAS,INTERES, MONTO_CON_INTERES, MONTO_X_CUOTA, APP_ORIGEN) 
    VALUES (TO_DATE('${args.fecMov}', 'yyyy/mm/dd hh24:mi:ss'), '${args.descripcion}', ${parseInt(args.haber)}, ${parseInt(args.comision)}, ${parseInt(args.montoRecibido)}, ${parseInt(args.nroComp1)}, ${parseInt(args.nroComp2)}, ${parseInt(args.idDecidir)}, ${parseInt(args.nroTransac)}, ${parseInt(args.idMedioPago)}, '${args.bin}', ${parseInt(args.idDecidir)}, '${args.ticket}', ${parseInt(args.cantCuotas)}, ${parseInt(args.interes)}, ${parseInt(args.montoConInteres)}, ${parseInt(args.montoPorCuota)}, '${args.appOrigen}')`;
    
    const result = await consulta(q);
    return result;

}

const obtenerUnPago = async(idDecidir) => {
    if (idDecidir == null || idDecidir.length == 0) return null;     
    try {
        const pago = await axios.get(`${decidirUrl}payments/${idDecidir}`, {
            params: {
                'expand': 'card_data'
            },
            headers: {
                'Content-Type': 'application/json',
                'apikey': decidirPrivateKey,
                'cache-control': 'no-cache',
            }
        })
        return await pago.data;  

    } catch (error) {
        console.log(error.response.data);
        return null;
    }
}

module.exports = { getPagoDecidir, postPagoDecidir, insertGesDecidir, obtenerUnPago};