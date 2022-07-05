// const { nroTran, appOrigen } = req.query || req.body;
const { getByNroTran } = require('../services/movimiento');
const { editLog } = require('../helpers/logDecidir');

const validarMovims = async(req, res, next) => {
    const { nroTran, appOrigen } = req.query;
    try {
        const movim = await getByNroTran(nroTran);
        
        if (!movim || movim == undefined) {
            const error = 'No existe la boleta correspondiente al número de transacción ingresado.'
            req.decidirLog.error = error;
            editLog(req.decidirLog);
            return res.status(404).json({
                message: error 
            });
        }
        req.movim = movim;
        next();       

    } catch (error) {
        console.log(error);
        const err = `Ocurrió un error obteniendo movimiento: ${error}`
        res.status(500).json({
            message: err,
        });   
    }
}
module.exports = {
    validarMovims
}