const { consulta } = require("../index");

const medioPagoById = async (medioPagoId) => {
  //? consultar id medio pago en tabla medio_pago
  try {
    let q = `SELECT * FROM TBL_DEC_MEDIO_PAGOS WHERE MEDIO_PAGO_ID = ${medioPagoId} AND HABILITADO = 1`;
    const result = await consulta(q);
    if (result.length == 0 || result == null) return null;
    return result[0];
  } 
  catch (error) {
    console.log(error);
    return null;
  }
};
const allMedioPago = async () => {
  try {
    let q = `SELECT * FROM TBL_DEC_MEDIO_PAGOS WHERE PROVEEDOR_PAGO_ID = 3 AND HABILITADO = 1`;
    const result = await consulta(q);
    if (result.length == 0 || result == null) return null;
    return result;
  } 
  catch (error) {
    console.log(error);
    return null;
  }
}
//? mediosPago join 
const mediosPagoJoin = async () => {
  try {
    let q = `SELECT MP.NOMBRE AS PAGO_NAME, EF.NOMBRE AS ENTIDAD_NAME, MPEF.MPAGO_ENT_FINANC_ID,
    MP.FORMATO_CVV, MP.SITE_ID, MP.MEDIO_PAGO_ID, MP.LONGITUD_PAN, MP.HABILITADO, MPEF.BINES, 
    MP.MEDIO_PAGO_ID, TDMPT.NOMBRE AS TIPO_PAGO_NAME, TDMPT.MEDIO_PAGO_TIPO_ID, EF.ENTIDAD_FINANCIERA_ID  
    FROM TBL_DEC_MEDIO_PAGO_ENT_FINANC MPEF
    INNER JOIN TBL_ENTIDADES_FINANCIERAS EF ON MPEF.MPAGO_ENT_FINANC_ID = EF.ENTIDAD_FINANCIERA_ID
    INNER JOIN TBL_DEC_MEDIO_PAGOS MP ON MP.MEDIO_PAGO_ID = MPEF.MEDIO_PAGO_ID
    INNER JOIN TBL_DEC_MEDIO_PAGO_TIPOS TDMPT ON TDMPT.MEDIO_PAGO_TIPO_ID = MP.MEDIO_PAGO_TIPO_ID 
    WHERE MPEF.HABILITADO = 1`
    
    const result = await consulta(q);
    if (result.length == 0 || result == null) return null;

    return result;

  } catch (error) {
    console.log(error);
    return null; 
  }
}

module.exports = {
  medioPagoById,
  allMedioPago,
  mediosPagoJoin,
};
