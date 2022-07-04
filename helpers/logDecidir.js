const crypto = require('crypto');

const addLog = (nroTran, paymentReq, appOrigen) => {
    if (nroTran == null || paymentReq == null ) return null   
    const args = {
        'gesDecidirLogId': crypto.randomUUID(),
        'fechaCreacion': new Date(),
        'fechaActualizacion': new Date(),
        'idMedioPago': paymentReq.paymentMethodId,
        'bin': paymentReq.bin,
        'monto': null,
        'cantCuotas': null,
        'interes': null,
        'montoConInteres': null,
        'montoPorCuota': null,
        'status': null,
        'error': null,
        'nroTran': nroTran,
        'appOrigen': appOrigen == null || appOrigen.length == 0 ? 'SAG_BACKEND' : appOrigen
    }
    return args
}
const editLog = (args) => {
    if (args == null) return null
    args.fechaActualizacion = new Date()
    return args
}

module.exports = { addLog, editLog };