// const { consulta } = require('../index');
const { consulta } = require('../vendor/transaction');


const getCuotaByID = async(idCuota) => {
    try {
        let q = `SELECT * FROM TBL_DEC_CUOTAS WHERE CUOTA_ID = ${idCuota}`;

        const result = await consulta(q);
        if (result.length == 0) return null;
        if (result == null) return null;
        return result[0];
        
    } catch (error) {
        console.log(error);
        return null;
    }
}
const allCuota = async() => {
    try {
        let q = `SELECT * FROM TBL_DEC_CUOTAS WHERE HABILITADO = 1`;
        const result = await consulta(q);
        if (result.length == 0) return null;
        return result;
    } 
    catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = {
    getCuotaByID, allCuota
}