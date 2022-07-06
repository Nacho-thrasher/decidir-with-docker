const crypto = require('crypto');
const { insertGesDecidirLog } = require('../services/decidir');

const addLog = (nroTran, paymentReq, appOrigen) => {
    if (nroTran == null || paymentReq == null ) return null   
    const args = {
        'gesDecidirLogId': crypto.randomUUID(),
        'fechaCreacion': new Date().toISOString().substring(0, 10) + ' ' + new Date().toISOString().substring(11, 19),
        'fechaActualizacion': new Date().toISOString().substring(0, 10) + ' ' + new Date().toISOString().substring(11, 19),
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
const editLog = async(args) => {
    if (args == null) return null
    args.fechaActualizacion = new Date().toISOString().substring(0, 10) + ' ' + new Date().toISOString().substring(11, 19);
    console.log('editLog', args);
    const response = await insertGesDecidirLog(args);
    console.log('response: ',response);
    
    return args
}

module.exports = { addLog, editLog };