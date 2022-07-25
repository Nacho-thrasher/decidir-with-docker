const { consulta } = require('../index');

const getByNroTran = async(req, res) => {
    const { nroTran } = req.query;
    try {
        let q = `SELECT * FROM GES_DECIDIR_LOG WHERE NRO_TRANSAC = ${nroTran}`;
        const result = await consulta(q);
        if (result.length == 0) return res.json(null); 
        return res.json({
            fecha_actualizacion: result[0].FECHA_ACTUALIZACION,
            monto: result[0].MONTO,
            status: result[0].STATUS,
            error: result[0].ERROR,
        });
    

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pagos: ${error}`
        })
    }
}

module.exports = { getByNroTran }