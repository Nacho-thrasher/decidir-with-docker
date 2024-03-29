const { medioPagoById } = require('../services/medioPago');
const { insertLog } = require('../helpers/logDecidir');

const validarMedioPago = async(req, res, next) => {
    const { paymentMethodId } = req.body;
    try {
        const medioPago = await medioPagoById(paymentMethodId);
        if (!medioPago || medioPago == undefined) {
            const error = 'No existe el medio de pago ingresado.'
            req.decidirLog.error = error;
            await insertLog(req.decidirLog);
            return res.status(404).send(error);
        }
        req.medioPago = medioPago;
        next(); 
              
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo medio de pago: ${error}`,
        });   
    }
}
module.exports = { validarMedioPago };