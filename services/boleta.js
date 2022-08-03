const { consulta } = require("../index");
const { getMontoGesDecidirLog, getByNroTran } = require("../services/movimiento");
//* servicio de boleta
const getBoletaById = async (nroTran) => {
  try {
    const boleta = await getByNroTran(nroTran);
    const montoPagado = await getMontoGesDecidirLog(nroTran);
    if (boleta == null) return null;
    if (montoPagado != null && montoPagado < boleta.TOTAL1) 
    {   
      boleta.PENDIENTE = boleta.TOTAL1 - montoPagado;
    }    
    return boleta;
  } 
  catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  getBoletaById,
};
