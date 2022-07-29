const { consulta } = require("../index");
//* servicio de boleta
const getBoletaById = async (nroTran) => {
  try {
    let q = `SELECT * FROM GES_MOVIMS_COD_BARRA2 
                WHERE NRO_TRANSAC = ${nroTran}`;
    const result = await consulta(q);
    if (result == null || result.length == 0) return null;
    return result[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  getBoletaById,
};
