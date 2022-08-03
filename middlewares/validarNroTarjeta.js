const { 
    getByNroTran, 
    getGesDecidirLog, 
    getMontoGesDecidirLog,
    countMovimsGesDecidirLog
} = require("../services/movimiento");

const validarNroTarjeta = async (req, res, next) => {
    const { nroTran, firstAmount, secondAmount } = req.query;
    const { movim } = req;
    try {
        //* 1 count de registros aprobados en ges decidir log
        const countAprobados = await countMovimsGesDecidirLog(nroTran);
        req.nroTransacParte = `${nroTran}-${countAprobados+1}`;
        console.log("count aprobados", req.nroTransacParte);
        //* 2 - Validar monto 1 o monto 2
        if (firstAmount) {
            if (firstAmount > movim.TOTAL1) {
                console.log("firstAmount", firstAmount);
                // const error = "El monto ingresado es mayor al monto a pagar.";
                // req.decidirLog.error = error;
                // await insertLog(req.decidirLog);
                // return res.status(400).send(error);
            }
            req.monto = firstAmount;
            req.tipoOperacion = "DISTRIBUTED"; 
        }
        else if (secondAmount) {
            const montoPagado = await getMontoGesDecidirLog(nroTran);
            //? si monto 2 + monto 1 > total1
            if (secondAmount + montoPagado > movim.TOTAL1) {
                // const error = "El monto ingresado es mayor al monto a pagar.";
                // req.decidirLog.error = error;
                // await insertLog(req.decidirLog);
                // return res.status(400).send(error);
                console.log(`secondAmount: ${secondAmount} + montoPagado: ${montoPagado} > movim.TOTAL1: ${movim.TOTAL1}`);
            }
            console.log(`secondAmount: ${secondAmount} + montoPagado: ${montoPagado} > movim.TOTAL1: ${movim.TOTAL1}`);

            req.monto = secondAmount;
            req.tipoOperacion = "DISTRIBUTED"; 
        }
        else{
            req.tipoOperacion = "SINGLE"; 
        }
        next();
        //? si no es pago con 1 tarjeta
    } 
    catch (error) {
        console.log(error);
        const err = `Ocurrió un error obteniendo movimiento: ${error}`;
        res.status(500).json({
            message: err,
        });
    }
}

module.exports = { validarNroTarjeta };