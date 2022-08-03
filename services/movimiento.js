const { consulta } = require("../index");
const {
  getMarcaReinscripcionFicha,
  devolverMaestro,
} = require("../services/gesMovimsCodBarra2");

const getByNroTran = async (nroTran) => {
  try {
    //? tmb consultar a ges-decidir para ver si el movimiento existe
    let q = `SELECT * FROM GES_MOVIMS_COD_BARRA2 WHERE NRO_TRANSAC = ${nroTran}`;
    const result = await consulta(q);
    if (result == null || result.length == 0) return null;
    return result[0];
    
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getDescription = async (movim) => {
  if (movim == null) return "";
  let modalidad = "";
  const marcaReinscripcionFicha = await getMarcaReinscripcionFicha(
    movim.TDOCU,
    movim.NDOCU,
    movim.LUGAR,
    movim.SECTOR,
    movim.CARRERA,
    movim.MODO
  );
  if (marcaReinscripcionFicha != null) {
    modalidad = marcaReinscripcionFicha;
  } else {
    const maestro = await devolverMaestro(
      movim.TDOCU,
      movim.NDOCU,
      movim.LUGAR,
      movim.SECTOR,
      movim.CARRERA,
      movim.MODO
    );
    if (maestro != null) {
      if (maestro.MARCA_INS != null) {
        modalidad = maestro.MARCA_INS;
      }
    }
  }
  console.log("modalidad: ", modalidad);
  //? Descripcion del movimiento:
  let descripcion = `PAGO SAG - ${modalidad} - ${movim.LUGAR} - ${movim.SECTOR} - ${movim.CARRERA} - ${movim.MODO}
    - ${movim.TDOCU} - ${movim.NDOCU} - ${movim.NRO_COMP1} - ${movim.NRO_COMP2}`;

  return descripcion;
};
const getGesDecidirLog = async (nroTran) => {
  try {
    let q = `SELECT * FROM GES_DECIDIR_LOG WHERE NRO_TRANSAC = ${nroTran} AND STATUS = 'approved'`;
    const result = await consulta(q);
    if (result == null || result.length == 0) return null;
    return result[0];
  } 
  catch (error) {
    console.log(error);
    return 'error';
  }
}
const getMontoGesDecidirLog = async (nroTran) => {
  try {

    let q = `SELECT SUM(MONTO) FROM GES_DECIDIR_LOG WHERE NRO_TRANSAC = ${nroTran} AND STATUS = 'approved'`;
    const result = await consulta(q);
    if (result == null || result.length == 0) return null;
    return result[0]['SUM(MONTO)'];

  } catch (error) {
    console.log(error);
    return 'error';
  }
}
const countMovimsGesDecidirLog = async (nroTran) => {
  try {
    
    let q = `SELECT COUNT(*) FROM GES_DECIDIR_LOG WHERE NRO_TRANSAC = ${nroTran} AND STATUS = 'approved'`;
    const result = await consulta(q);
    if (result == null || result.length == 0) return null;
    return result[0]['COUNT(*)'];

  } 
  catch (error) {
    console.log(error);
    return 'error';
  }
}

module.exports = { getByNroTran, getDescription, getGesDecidirLog, getMontoGesDecidirLog, countMovimsGesDecidirLog };
