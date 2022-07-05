const { consulta } = require('../index');

const medioPagoById = async (medioPagoId) => {
    //? consultar id medio pago en tabla medio_pago
    try {

        let q = `SELECT * FROM TBL_DEC_MEDIO_PAGOS WHERE MEDIO_PAGO_ID = ${medioPagoId}`;

        const result = await consulta(q);
        
        if (result.length == 0) return null;
        if (result == null) return null;
        return result[0];

    } catch (error) {
        console.log(error);
        return null;
    }

}

module.exports = {
    medioPagoById
}