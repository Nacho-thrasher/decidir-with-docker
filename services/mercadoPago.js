const { consulta } = require('../index');

const getMarcaReinscripcionFicha = async(tdocu, ndocu, lugar, sector, carrera, modo) => {
    try {
        let q = `SELECT INSC_REINS FROM GES_FICHAS 
                WHERE TDOCU = '${tdocu}' AND NDOCU = ${ndocu} AND LUGAR = ${lugar} AND SECTOR = ${sector} AND CARRERA = ${carrera} AND MODO = ${modo}`;
       
        const result = await consulta(q);
        if (result.length == 0) return null;
        if (result == null) return null;
        console.log('aqui reinsc ',result);
        return result[0]
        
    } catch (error) {
        console.log(error);
        return null
    }   
}
const devolverMaestro = async(tdocu, ndocu, lugar, sector, carrera, modo) => {
    try {
        let q = `SELECT * FROM GES_MAESTROS
                WHERE TDOCU = '${tdocu}' AND NDOCU = ${ndocu} AND LUGAR = ${lugar} AND SECTOR = ${sector} AND CARRERA = ${carrera} AND MODO = ${modo}`; 
       
        const result = await consulta(q);
        if (result.length == 0) return null;
        if (result == null) return null;
        console.log('aqui maestr ',result);
        return result[0]
        
    } catch (error) {
        console.log(error);
        return null
    }   
}

module.exports = { getMarcaReinscripcionFicha, devolverMaestro };