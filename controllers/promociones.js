// const { consulta } = require("../index");
const { consulta } = require('../vendor/transaction');


const getPromocionesByEntFinanc = async (req, res) => {
    try {
        const { id } = req.params;

        const q = `
        SELECT * FROM TBL_MEDIO_PAGO_PROMOCION TMPP 
        INNER JOIN TBL_PAGOS_PROMOCIONES TPP ON TMPP.PAGO_PROMOCION_ID = TPP.PAGO_PROMOCION_ID
        INNER JOIN TBL_TIPO_PROMOCION TTP ON TTP.TIPO_PROMOCION_ID = TPP.TIPO_PROMOCION_ID 
        WHERE TMPP.MPAGO_ENT_FINANC_ID = ${id}
        `;
        const result = await consulta(q);
        if (result == null || result.length == 0) return res.json({});
        console.log('entro 2:',result);
        return res.status(200).json(result);        
        
    } catch (error) {
        console.log(error);
        res.status(400).send("Error al obtener las promociones");
    }
}

module.exports = { getPromocionesByEntFinanc };