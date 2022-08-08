const { allEntidadesFinancieras } = require('../services/entidadesFinancieras');

const getAll = async(req, res) => {
    try {
        
        const result = await allEntidadesFinancieras();
        if (result.length == 0) return res.status(400).send('No hay entidades financieras habilitadas.');
        const data = result.map(item => {
            return {
                entidadFinancieraId: { id: item.ENTIDAD_FINANCIERA_ID },
                nombre: item.NOMBRE,
                habilitado: item.HABILITADO,
            }
        })
        return res.json(data);
    } 
    catch (error) {
        console.log(error);
        res.status(500).send(
            `Ocurrió un error obteniendo pagos: ${error}`
        )
    }
}
const getById = async(req, res) => {}

module.exports = { getAll, getById }