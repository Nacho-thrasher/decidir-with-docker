const { consulta } = require('../index');

const getBoletaById = async (nroTran) => {
    try {
        let q = `SELECT * FROM GES_MOVIMS_COD_BARRA2 
                WHERE NRO_TRANSAC = ${nroTran}`;
        
        const result = await consulta(q);
        //? si es un array vacio es porque no existe la boleta
        if (result.length == 0) return null;
        if (result == null) return null;
        return result;
        
    } catch (error) {
        console.log(error);
        return null
    }
}

module.exports = {
    getBoletaById
}