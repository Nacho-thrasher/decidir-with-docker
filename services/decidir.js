// http://www-desa.ucasal.edu.ar/inscripciones/
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
    // console.log('llego a postPagoDecidir ', 'movim.NRO_TRANSAC'); //? token es transaction_id
    console.log('llego a postPagoDecidir ', siteId); 
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
        //? se crea el pago en decidir
        const pago = await axios.post(`${decidirUrl}payments`, 
        args, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': decidirPrivateKey,
                'cache-control': 'no-cache',
            }
        })
        // console.log('aqui decidir: ',pago.data);
        return await pago.data;

    } catch (error) {
        console.log(error.response.data);
        return null;
    }
}

const insertGesDecidir = async(args) => {

    let q = `INSERT INTO GES_DECIDIR 
    (FEC_MOV, DESCRIPCION, HABER, COMISION, MONTO_RECIBIDO, NRO_COMP1, NRO_COMP2, NRO_TRANSAC, ID_MEDIO_PAGO, BIN, ID_DECIDIR, TICKET, CANT_CUOTAS,INTERES, MONTO_CON_INTERES, MONTO_X_CUOTA, APP_ORIGEN) 
    VALUES (TO_DATE('${args.fecMov}', 'yyyy/mm/dd hh24:mi:ss'), '${args.descripcion}', ${parseInt(args.haber)}, ${parseInt(args.comision)}, ${parseInt(args.montoRecibido)}, ${parseInt(args.nroComp1)}, ${parseInt(args.nroComp2)}, ${parseInt(args.nroTransac)}, ${parseInt(args.idMedioPago)}, '${args.bin}', ${parseInt(args.idDecidir)}, '${args.ticket}', ${parseInt(args.cantCuotas)}, ${parseInt(args.interes)}, ${parseInt(args.montoConInteres)}, ${parseInt(args.montoPorCuota)}, '${args.appOrigen}')`;
    
    console.log({
        FEC_MOV: args.fecMov,
        descripcion: args.descripcion,
        haber: args.haber,
        comision: args.comision,
        montoRecibido: args.montoRecibido,
        nroComp1: args.nroComp1,
        nroComp2: args.nroComp2,
        nroTransac: args.nroTransac,
        idMedioPago: args.idMedioPago,
        bin: args.bin,
        idDecidir: args.idDecidir,
        ticket: args.ticket,
        cantCuotas: args.cantCuotas,
        interes: args.interes,
        montoConInteres: args.montoConInteres,
        montoPorCuota: args.montoPorCuota,
        appOrigen: args.appOrigen
    });
    
    const result = await consulta(q);
    return result;

}

module.exports = { getPagoDecidir, postPagoDecidir, insertGesDecidir};
//! PENDIENTE NRO COMP1 ETC