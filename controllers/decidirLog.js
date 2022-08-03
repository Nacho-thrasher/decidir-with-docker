const { getGesDecidirLog, getMontoGesDecidirLog } = require('../services/movimiento');

const getByNroTran = async(req, res) => {
    const { nroTran } = req.query;
    try {
        const movimGesDecidirLog = await getGesDecidirLog(nroTran);
        const montoPagado = await getMontoGesDecidirLog(nroTran);
        console.log("montoPagado", montoPagado);
        if (movimGesDecidirLog == null || montoPagado == null) {
            //* no se pago con este numero de transaccion aun
            return res.json(null); 
        }
        else if (montoPagado == movimGesDecidirLog.MONTO_A_APGAR) {
            return res.json({
                fecha_actualizacion: movimGesDecidirLog.FECHA_ACTUALIZACION,
                monto: movimGesDecidirLog.MONTO_A_APGAR,
                status: movimGesDecidirLog.STATUS,
                error: movimGesDecidirLog.ERROR,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pagos: ${error}`
        })
    }
}

module.exports = { getByNroTran }