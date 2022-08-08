const { getByNroTran } = require('../services/movimiento');
const { getCuotaByID } = require('../services/cuota');

const getById = async(req, res) => {
    const { id, nroTran } = req.query;
    try {
        const movim = await getByNroTran(nroTran);
        if (!movim || movim == undefined) {
            return res.json({
            });
        }
        const cuota = await getCuotaByID(id);
        if (!cuota || cuota == undefined) {
            const error = 'No existe la cuota correspondiente al ID ingresado.'
            return res.status(400).json(error);
        }    
        return res.json({
            cuotaId: cuota.CUOTA_ID,
            medioPagoEntFinancId: cuota.MPAGO_ENT_FINANC_ID,
            cantidad: cuota.CANTIDAD,
            interes: cuota.INTERES,
            habilitado: cuota.HABILITADO,
            vigenciaDesde: cuota.VIGENCIA_DESDE,
            vigenciaHasta: cuota.VIGENCIA_HASTA,
            condicionAlumno: cuota.CONDICION_ALUMNO,
        });     

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pagos: ${error}`
        })
    }
}

module.exports = { getById }