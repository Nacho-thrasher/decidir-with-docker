const { consulta } = require('../index');

const getAll = async(req, res) => {
    try {
        //? TBL_ENTIDADES_FINANCIERAS
        let q = `SELECT * FROM TBL_ENTIDADES_FINANCIERAS WHERE HABILITADO = 1`;    
        const result = await consulta(q);
        if (result.length == 0) return null;
        const data = result.map(item => {
            return {
                descripcion: item.DESCRIPCION,
                entidadFinancieraId: { id: item.ENTIDAD_FINANCIERA_ID },
                habilitado: item.HABILITADO,
                nombre: item.NOMBRE
            }
        })
        return res.json(data);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pagos: ${error}`
        })
    }
}
const getById = async(req, res) => {}

module.exports = { getAll, getById }