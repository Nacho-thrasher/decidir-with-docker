const { consulta } = require("../index");
//* servicio de boleta
const getBoletaById = async (nroTran) => {
  try {
    
    let q = `SELECT * FROM GES_MOVIMS_COD_BARRA2 WHERE NRO_TRANSAC = ${nroTran}`;  
    const result = await consulta(q);
    let q2 = `SELECT SUM(MONTO) FROM GES_DECIDIR_LOG WHERE nro_transac = ${nroTran} AND STATUS = 'approved'`
    const result2 = await consulta(q2);
    
    if (result == null || result.length == 0) return null;
    if (result2[0]['SUM(MONTO)'] != null && result2[0]['SUM(MONTO)'] < result[0].TOTAL1) 
    {   
      result[0].PENDIENTE = result[0].TOTAL1 - result2[0]['SUM(MONTO)'];
    }
    console.log('result :', result[0]);
    return result[0];

  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  getBoletaById,
};
