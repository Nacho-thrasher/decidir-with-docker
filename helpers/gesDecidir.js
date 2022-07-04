const crypto = require('crypto');
const { calcularMontoConInteres, calcularMontoPorCuota } = require('../helpers/cuota');
const { getDescription } = require('../services/movimiento');

const addGesDecidir = async(nroTran, paymentReq, amount, movim, paymentResp, cuota, appOrigen) => {
    if (nroTran == null || paymentReq == null || amount == null ||  movim == null || cuota == null) {
        return null
    }    
    const descripcion = await getDescription(movim);
    const args = {
        gesDecidirId: crypto.randomUUID(),
        descripcion: descripcion,
        haber: amount,
        comision: 0,
        montoRecibido: amount,
        nroTransac: nroTran,
        idMedioPago: paymentReq.paymentMethodId,
        bin: paymentReq.bin,
        idDecidir: paymentResp.id,
        ticket: paymentResp.status_details.ticket,
        cantCuotas: cuota.CANTIDAD,
        interes: cuota.INTERES,
        montoConInteres: calcularMontoConInteres(amount, cuota.INTERES),
        montoPorCuota: calcularMontoPorCuota(amount, cuota.CANTIDAD, cuota.INTERES),
        appOrigen: appOrigen == null || appOrigen.length == 0 ? 'SAG_BACKEND' : appOrigen,
    }
    return args

}

module.exports = { addGesDecidir };