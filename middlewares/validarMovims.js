// const { nroTran, appOrigen } = req.query || req.body;
const { getByNroTran, getGesDecidirLog, getMontoGesDecidirLog } = require("../services/movimiento");
const { insertLog } = require("../helpers/logDecidir");

const validarMovims = async (req, res, next) => {
  const { nroTran, appOrigen } = req.query;
  try {
    //* 1 - Validar que exista el movimiento
    const movim = await getByNroTran(nroTran);
    if (!movim || movim == undefined) {
      const error = "No existe la boleta correspondiente al número de transacción ingresado.";
      req.decidirLog.error = error;
      await insertLog(req.decidirLog);
      return res.status(400).send(error);
    }
    //* 2 - Validar si existe una transacción pendiente en gesDecidirLog
    const gesDecidirLog = await getGesDecidirLog(nroTran); //* monto a pagar
    const montoPagado = await getMontoGesDecidirLog(nroTran); //* monto pagado
    //* 3 - Validar que el monto pagado sea igual al monto a pagar
    if (gesDecidirLog != null) {
      if (montoPagado < gesDecidirLog.MONTO_A_APGAR) { 
        movim.pendiente = true;
        movim.montoPendiente = gesDecidirLog.MONTO_A_APGAR - montoPagado;
        console.log("movim.montoPendiente", movim.montoPendiente);
      }
      else{ 
        movim.pendiente = false;  
      }
    }
    req.movim = movim;
    req.decidirLog.nroComp1 = movim.NRO_COMP1,
    req.decidirLog.nroComp2 = movim.NRO_COMP2,
    req.decidirLog.appOrigen = appOrigen
    next();
  } 
  catch (error) {
    console.log(error);
    const err = `Ocurrió un error obteniendo movimiento: ${error}`;
    res.status(500).json({
      message: err,
    });
  }
};
module.exports = {
  validarMovims,
};
