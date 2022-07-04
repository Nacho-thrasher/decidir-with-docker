const { getBoletaById } = require('../services/boleta');	

const getBoleta = async(req, res) => {
    let { nroTran } = req.query;
    try { 
        //? resolve nro transac float
        const movim = await getBoletaById(nroTran);
        if (!movim) {
            return res.status(404).json({
                message: 'No existe la boleta correspondiente al número de transacción ingresado.'
            });
        }
        res.status(200).json({
            message: 'Boleta obtenida',
            data: movim,
        });
        // decidirLog: req.decidirLog
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo movimiento: ${error}`,
        });
    }
}

module.exports = {
    getBoleta
}