const { devolucionDecidir } = require('../services/decidir');
const { consulta } = require('../index');

const devolucionPago = async(req, res) => {
    const { nroTran } = req.query;
    try {
        let q = `SELECT * FROM GES_DECIDIR_LOG WHERE NRO_TRANSAC = ${nroTran} AND STATUS = 'approved'`;
        const result = await consulta(q);
        if (result == null || result.length == 0) 
        return res.status(400).send("No se encontraron pagos aprobados para el nro de transacción indicado");
        
        let idDecidir = [];
        result.forEach(element => {
            idDecidir.push(element.NRO_OPERACION);
        })
        
        let devoluciones = [];
        for (let i = 0; i < idDecidir.length; i++) {
            const devolucion = await devolucionDecidir(idDecidir[i]);
            devoluciones.push(devolucion);
        }
        
        if (devoluciones.length == 0) 
        return res.status(400).send("No se pudo anular el pago" + nroTran); 
        
        console.log(`devoluciones: ${devoluciones}`);
        return res.status(200).json(devoluciones);
        
    } catch (error) {
        console.log(error);
        res.status(400).send(`Ocurrió un error obteniendo pago: ${error}`);
    }

}

module.exports = { devolucionPago };