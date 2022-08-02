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
        'appOrigen': appOrigen == null || appOrigen.length == 0 ? 'SAG_BACKEND' : appOrigen,
        'nroOperacion': null,
        'nroComp1': null,
        'nroComp2': null,
        'montoAPagar': null,
        'descripcion': null,
        'tipoOperacion': null,
        'ticket': null,
        'nroTransacParte': null,
    }
    return args
}
const insertLog = async(args) => {
    if (args == null) return null
    args.fechaActualizacion = new Date().toISOString().substring(0, 10) + ' ' + new Date().toISOString().substring(11, 19);
    const resp = await insertGesDecidirLog(args);
    //? si llega nulo o fallo se retorna null
    //? si llega un objeto, se retorna el objeto y se realiza consulta sum(monto) para ver si se pagó correctamente, si esta completo el pago inserto en ges decidir
    console.log('insertLog :', resp);
    return resp
}



module.exports = { addLog, insertLog };