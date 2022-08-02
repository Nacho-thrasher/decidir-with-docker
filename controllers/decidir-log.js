const { consulta } = require('../index');
//? si fue rechazado, se muestra el mensaje de rechazo
//? si es nulo, se muestra
const getByNroTran = async(req, res) => {
    const { nroTran } = req.query;
    try {
        let q = `SELECT * FROM GES_DECIDIR_LOG WHERE NRO_TRANSAC = ${nroTran} AND STATUS = 'approved'`;
        const result = await consulta(q);
        let q2 = `SELECT SUM(MONTO) FROM GES_DECIDIR_LOG WHERE nro_transac = ${nroTran} AND STATUS = 'approved'`
        const result2 = await consulta(q2);
        // console.log('result :', result, result2);
        if (result.length == 0 || result2[0]['SUM(MONTO)'] == null) return res.json(null); 
        //? consultar a ges movims y obtener el monto para comprovar que no se haya pagado
        if (result2[0]['SUM(MONTO)'] == result[0].MONTO_A_APGAR) {
            return res.json({
                fecha_actualizacion: result[0].FECHA_ACTUALIZACION,
                monto: result[0].MONTO_A_APGAR,
                status: result[0].STATUS,
                error: result[0].ERROR,
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pagos: ${error}`
        })
    }
}

module.exports = { getByNroTran }