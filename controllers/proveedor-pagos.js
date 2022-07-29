const { consulta } = require('../index');

const getAll2 = async(req, res) => {
    //? TBL_DEC_PROVEEDOR_PAGOS
    const { nroTran } = req.query;
    try {
        console.log(`nroTran: ${nroTran}`);
        //* proveedor de pagos habilitado 
        let q = `SELECT * FROM TBL_DEC_PROVEEDOR_PAGOS WHERE HABILITADO = 1`;    
        const result = await consulta(q);
        if (result.length == 0) return res.status(400).send('No existen proveedores de pagos habilitados.');
        //* medios de pagos por id de proveedor de pagos
        //! 3 -> decidir cambiar a query 
        q2 = `SELECT * FROM TBL_DEC_MEDIO_PAGOS WHERE PROVEEDOR_PAGO_ID = 3 AND HABILITADO = 1`;
        const result2 = await consulta(q2);
        
        if (result2.length == 0) return res.status(400).send('No existen medios de pagos habilitados.');
        const data = result.map(item => {
            return {
                habilitado: item.HABILITADO,
                imgBtn: item.IMG_BTN,
                medioPagos: result2.map(item2 => {
                    return {
                        formatoCvv: item2.FORMATO_CVV,
                        habilitado: item2.HABILITADO,
                        longitudPan: item2.LONGITUD_PAN,
                        medioPagoEntFinancs: {},
                        medioPagoId: { id: item2.MEDIO_PAGO_ID },
                        nombre: item2.NOMBRE,
                        siteId: item2.SITE_ID,
                    }
                }),
                nombre: item.NOMBRE,
                proveedorPagoId: { id: item.PROVEEDOR_PAGO_ID },
            }
        })
        return res.json(data)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pagos: ${error}`
        })
    }
}
//? id2 -> id de proveedor de pagos, nroTran numero de transferencia
const getById = async(req, res) => {
    const { id, nroTran } = req.query;
    try {
        let q = `SELECT * FROM TBL_DEC_PROVEEDOR_PAGOS WHERE PROVEEDOR_PAGO_ID = ${id}`;
        console.log(`q: ${q}`);
        const result = await consulta(q);
        if (result.length == 0 || result[0].HABILITADO === 0) return res.status(400).send('No existe el proveedor de pagos.');

        q2 = `SELECT TBL_DEC_MEDIO_PAGOS.NOMBRE AS PAGO_NAME, TBL_ENTIDADES_FINANCIERAS.NOMBRE AS ENTIDAD_NAME, TBL_DEC_MEDIO_PAGO_ENT_FINANC.MPAGO_ENT_FINANC_ID  AS ID_MEDIOPAGO_ENTFINANC,
        TBL_DEC_MEDIO_PAGOS.FORMATO_CVV, TBL_DEC_MEDIO_PAGOS.SITE_ID, TBL_DEC_MEDIO_PAGOS.MEDIO_PAGO_ID, TBL_DEC_MEDIO_PAGOS.LONGITUD_PAN, TBL_DEC_MEDIO_PAGOS.HABILITADO
        FROM TBL_DEC_MEDIO_PAGO_ENT_FINANC
        JOIN TBL_DEC_MEDIO_PAGOS ON TBL_DEC_MEDIO_PAGO_ENT_FINANC.MEDIO_PAGO_ID = TBL_DEC_MEDIO_PAGOS.MEDIO_PAGO_ID
        JOIN TBL_ENTIDADES_FINANCIERAS ON TBL_ENTIDADES_FINANCIERAS.ENTIDAD_FINANCIERA_ID  = TBL_DEC_MEDIO_PAGO_ENT_FINANC.ENTIDAD_FINANCIERA_ID
        WHERE TBL_ENTIDADES_FINANCIERAS.HABILITADO = 1
        `;        
        const result2 = await consulta(q2);
        if (result2.length == 0) return res.status(400).send('Error inesperado');

        q3 = `SELECT * FROM TBL_DEC_CUOTAS WHERE HABILITADO = 1`;
        const result3 = await consulta(q3);
        if (result3.length == 0) return res.status(400).send('Error inesperado');

        const data = result.map(item => {
        return {
            habilitado: item.HABILITADO,
            imgBtn: item.IMG_BTN,
            medioPagos: result2.map(item2 => {
            return {
                formatoCvv: item2.FORMATO_CVV,
                habilitado: item2.HABILITADO,
                longitudPan: item2.LONGITUD_PAN,
                medioPagoEntFinancs: [{
                    cuotas: result3.filter(item3 => item3.MPAGO_ENT_FINANC_ID == item2.ID_MEDIOPAGO_ENTFINANC)
                    .map(item3 => {
                        return {                     
                            cantidad: item3.CANTIDAD,
                            cuotaId: { id: item3.CUOTA_ID },
                            habilitado: item3.HABILITADO,
                            interes: item3.INTERES,
                            medioPagoEntFinancId: item3.MPAGO_ENT_FINANC_ID,
                            vigenciaDesde: item3.VIGENCIA_DESDE,
                            vigenciaHasta: item3.VIGENCIA_HASTA,
                        }
                    }),
                    habilitado: item2.HABILITADO,
                    medioPagoEntFinancId: { id: item2.ID_MEDIOPAGO_ENTFINANC},
                }],
                medioPagoId: { id: item2.MEDIO_PAGO_ID },
                nombre: item2.PAGO_NAME,
                siteId: item2.SITE_ID,
            }
            }),
            nombre: item.NOMBRE,
            proveedorPagoId: { id: item.PROVEEDOR_PAGO_ID },
        }
        })
        return res.json(data)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pagos: ${error}`
        })   
    }
}

module.exports = { getAll2, getById }