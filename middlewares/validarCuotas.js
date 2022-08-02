const { getCuotaByID } = require('../services/cuota');
const { insertLog } = require('../helpers/logDecidir');

const validarCuotas = async(req, res, next) => {
    const { cuotaId } = req.body;
    try {
        const cuota = await getCuotaByID(cuotaId);
        if (!cuota || cuota == undefined) {
            const error = 'No existe la cuota correspondiente al ID ingresado.'
            req.decidirLog.error = error;
            await insertLog(req.decidirLog);
            return res.status(404).json({
                message: error
            });
        }
        req.cuota = cuota;
        req.decidirLog.cantCuotas = cuota.CANTIDAD;
        req.decidirLog.interes = cuota.INTERES;
        next();       
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo cuota: ${error}`,
        });   
    }
}

module.exports = { validarCuotas };