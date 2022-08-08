const { consulta } = require('../index');

const allEntidadesFinancieras = async() => {
    try {
        let q2 = `SELECT MP.NOMBRE AS PAGO_NAME, EF.NOMBRE AS ENTIDAD_NAME, MPEF.MPAGO_ENT_FINANC_ID,
        MP.FORMATO_CVV, MP.SITE_ID, MP.MEDIO_PAGO_ID, MP.LONGITUD_PAN, MP.HABILITADO, MPEF.BINES,
        MP.MEDIO_PAGO_ID, MPT.NOMBRE, MPT.MEDIO_PAGO_TIPO_ID FROM TBL_DEC_MEDIO_PAGO_ENT_FINANC MPEF
        INNER JOIN TBL_ENTIDADES_FINANCIERAS EF ON MPEF.MPAGO_ENT_FINANC_ID = EF.ENTIDAD_FINANCIERA_ID
        INNER JOIN TBL_DEC_MEDIO_PAGOS MP ON MP.MEDIO_PAGO_ID = MPEF.MEDIO_PAGO_ID
        INNER JOIN TBL_DEC_MEDIO_PAGO_TIPOS MPT ON MP.MEDIO_PAGO_TIPO_ID = MPT.MEDIO_PAGO_TIPO_ID 
        WHERE MPEF.HABILITADO = 1;
        `
        let q = `SELECT * FROM TBL_ENTIDADES_FINANCIERAS WHERE HABILITADO = 1`;
        const result = await consulta(q);
        if (result.length == 0) return null;
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = { 
    allEntidadesFinancieras 
};