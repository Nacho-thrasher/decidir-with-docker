const { addLog } = require('../helpers/logDecidir');

const validarBody = (req, res, next) => {
    console.log(`validarBody: ${req.body} ${req.query}`);
    //? en body debe haber campos (token, siteTransactionId, paymentMethodId, bin, cuotaId)
    const { token, siteTransactionId, paymentMethodId, bin, cuotaId, appOrigen } = req.body || req.query;
    if (!token || !siteTransactionId || !paymentMethodId || !bin || !cuotaId) {
        return res.status(400).json({
            message: 'Faltan campos en el body.'
        });
    }    
    req.PaymentRequestDto = req.body;
    req.decidirLog = addLog(siteTransactionId, req.body, appOrigen );
    next();
}
module.exports = { validarBody };
