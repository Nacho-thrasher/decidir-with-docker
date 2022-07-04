const { consulta } = require('../index');

const getMarcaReinscripcionFicha = async(tdocu, ndocu, lugar, sector, carrera, modo) => {
    try {
        let q = `SELECT INSC_REINS FROM GES_FICHAS 
                WHERE TDOCU = ${tdocu} AND NDOCU = ${ndocu} AND LUGAR = ${lugar} AND SECTOR = ${sector} AND CARRERA = ${carrera} AND MODO = ${modo}`;
       
        const result = await consulta(q);
        if (result.length == 0) return null;
        if (result == null) return null;
        return result[0]
        
    } catch (error) {
        console.log(error);
        return null
    }   
}
const devolverMaestro = async(tdocu, ndocu, lugar, sector, carrera, modo) => {
    try {
        let q = `SELECT T FROM GES_MAESTROS T
                WHERE T.TDOCU = ${tdocu} AND T.NDOCU = ${ndocu} AND T.LUGAR = ${lugar} AND T.SECTOR = ${sector} AND T.CARRERA = ${carrera} AND T.MODO = ${modo}`; 
       
        const result = await consulta(q);
        if (result.length == 0) return null;
        if (result == null) return null;
        return result[0]
        
    } catch (error) {
        console.log(error);
        return null
    }   
}

module.exports = { getMarcaReinscripcionFicha, devolverMaestro };