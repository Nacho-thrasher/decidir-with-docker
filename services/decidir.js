// http://www-desa.ucasal.edu.ar/inscripciones/
// const { DECIDIR_URL, DECIDIR_PRIVATE_KEY } = process.env;
const axios = require('axios');
const decidirUrl = `https://developers.decidir.com/api/v2/`
const decidirPrivateKey = `1b19bb47507c4a259ca22c12f78e881f`
const { consulta } = require('../index');
//? manejo de errores con tracerId 
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
    }
    catch (error) {
        console.log(error);
        return null;
    }
}
const postPagoDecidir = async(paymentRequest, movim, amount, cuotas, siteId, nroTransacParte) => {
    if (paymentRequest == null || movim == null) return null;     
    try {
        const args = {
            "establishment_name": "UCASAL",
            "token": paymentRequest.token,
            "site_transaction_id": nroTransacParte ? nroTransacParte : (movim.NRO_TRANSAC).toString(),
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
        //? ya se realizo el pago en decidir //? cambiar esto
        if (error.response.data.hasOwnProperty('validation_errors')) {
            if (error.response.data.validation_errors[0].hasOwnProperty('code')) {
                const code = error.response.data.validation_errors[0].code;
                console.log(code);
                return code == 'repeated' ? { error: 'Ya se realizo un pago con este id_transaction' } : { error: error.response.data };
            }
        }          
        return null;
    }
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
const insertGesDecidir = async(args) => {

    let q = `INSERT INTO GES_DECIDIR 
    (FEC_MOV, DESCRIPCION, HABER, COMISION, MONTO_RECIBIDO, NRO_COMP1, NRO_COMP2, NRO_OPERACION, NRO_TRANSAC, ID_MEDIO_PAGO, BIN, ID_DECIDIR, TICKET, CANT_CUOTAS,INTERES, MONTO_CON_INTERES, MONTO_X_CUOTA, APP_ORIGEN) 
    VALUES (TO_DATE('${args.fecMov}', 'yyyy/mm/dd hh24:mi:ss'), '${args.descripcion}', ${parseInt(args.haber)}, ${parseInt(args.comision)}, ${parseInt(args.montoRecibido)}, ${parseInt(args.nroComp1)}, ${parseInt(args.nroComp2)}, ${parseInt(args.idDecidir)}, ${parseInt(args.nroTransac)}, ${parseInt(args.idMedioPago)}, '${args.bin}', ${parseInt(args.idDecidir)}, '${args.ticket}', ${parseInt(args.cantCuotas)}, ${parseInt(args.interes)}, ${parseInt(args.montoConInteres)}, ${parseInt(args.montoPorCuota)}, '${args.appOrigen}')`;
    
    const result = await consulta(q);
    return result;
}
const insertGesDecidirLog = async(args) => {
    //* 1 inserto en ges_decidir_log
    //! TODO: MONTO_A_PAGAR
    let q = `INSERT INTO GES_DECIDIR_LOG
    (ID, FECHA_CREACION, FECHA_ACTUALIZACION, ID_MEDIO_PAGO, BIN, MONTO, CANT_CUOTAS, INTERES, MONTO_CON_INTERES, MONTO_X_CUOTA, STATUS, ERROR, NRO_TRANSAC, APP_ORIGEN, NRO_OPERACION, NRO_COMP1, NRO_COMP2, MONTO_A_APGAR, DESCRIPCION, TIPO_OPERACION, TICKET, NRO_TRANSAC_PARTE)
    VALUES ('${args.gesDecidirLogId}', 
        TO_DATE('${args.fechaCreacion}', 'yyyy/mm/dd hh24:mi:ss'), 
        TO_DATE('${args.fechaActualizacion}', 'yyyy/mm/dd hh24:mi:ss'), 
        ${parseInt(args.idMedioPago)}, 
        '${args.bin}', 
        ${parseInt(args.monto)},
        ${parseInt(args.cantCuotas)}, 
        ${parseInt(args.interes)}, 
        ${parseInt(args.montoConInteres)}, 
        ${parseInt(args.montoPorCuota)}, 
        '${args.status}', 
        '${args.error}', 
        ${parseInt(args.nroTran)}, 
        '${args.appOrigen}',
        ${parseInt(args.nroOperacion)},
        ${parseInt(args.nroComp1)},
        ${parseInt(args.nroComp2)},
        ${parseInt(args.montoAPagar)},
        '${args.descripcion}',
        '${args.tipoOperacion}',
        '${args.ticket}',
        '${args.nroTransacParte}')`;

    const result = await consulta(q);
    //* 2 consultar ges decidir log si se inserto correctamente
    let q2 = `SELECT * FROM GES_DECIDIR_LOG WHERE ID = '${args.gesDecidirLogId}'`;
    const result2 = await consulta(q2);
    return result2;
}

module.exports = { getPagoDecidir, postPagoDecidir, insertGesDecidir, obtenerUnPago, insertGesDecidirLog};
//? traer promociones de tarjeta
// SELECT * FROM TBL_DEC_MEDIO_PAGO_ENT_FINANC
// JOIN TBL_MEDIO_PAGO_PROMOCION ON TBL_DEC_MEDIO_PAGO_ENT_FINANC.MPAGO_ENT_FINANC_ID = TBL_MEDIO_PAGO_PROMOCION.MPAGO_ENT_FINANC_ID
// JOIN TBL_PAGOS_PROMOCIONES ON TBL_PAGOS_PROMOCIONES.PAGO_PROMOCION_ID = TBL_MEDIO_PAGO_PROMOCION.PAGO_PROMOCION_ID   