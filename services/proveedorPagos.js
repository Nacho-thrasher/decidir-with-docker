const { consulta } = require('../index');

const getAllProveedorPago = async(nroTran) => {
    try {
        let q = `SELECT * FROM TBL_DEC_PROVEEDOR_PAGOS WHERE HABILITADO = 1`;
        const result = await consulta(q);
        if (result.length == 0) return null;
        return result;
    } 
    catch (error) {
        console.log(error);
        return null        
    }
}
const getProveedorPagoById = async(id) => {
    try {
        let q = `SELECT * FROM TBL_DEC_PROVEEDOR_PAGOS WHERE PROVEEDOR_PAGO_ID = ${id} AND HABILITADO = 1`;
        const result = await consulta(q);
        if (result.length == 0) return null;
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
}


module.exports = { getAllProveedorPago, getProveedorPagoById };