const { getAllProveedorPago, getProveedorPagoById } = require('../services/proveedorPagos');
const { allMedioPago, mediosPagoJoin } = require('../services/medioPago');
const { allCuota } = require('../services/cuota');

const getAll2 = async(req, res) => {
    //? TBL_DEC_PROVEEDOR_PAGOS
    const { nroTran } = req.query;
    try {
        const result = await getAllProveedorPago(nroTran);
        if (result == null) return res.status(400).send('No se encontraron proveedores de pagos habilitados.');

        const result2 = await allMedioPago();
        if (result2 == null) return res.status(400).send('No se encontraron medios de pagos habilitados.');
        
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
    } 
    catch (error) {
        console.log(error);
        res.status(500).send(`Ocurrió un error obteniendo pagos: ${error}`)
    }
}
//? id2 -> id de proveedor de pagos, nroTran numero de transferencia
const getById = async(req, res) => {
    const { id, nroTran } = req.query;
    try {
        const result = await getProveedorPagoById(id);
        if (result == null) return res.status(400).send('No se encontró el proveedor de pagos.');
        
        const result2 = await mediosPagoJoin();
        if (result2 == null) return res.status(400).send('No se encontraron medios de pagos habilitados.');

        const result3 = await allCuota();        
        if (result3 == null) return res.status(400).send('No se encontraron cuotas habilitadas.');
        
        const data = result.map(item => {
            return {
                habilitado: item.HABILITADO,
                imgBtn: item.IMG_BTN,
                nombre: item.NOMBRE,
                proveedorPagoId: { id: item.PROVEEDOR_PAGO_ID },
                medioPagos: result2.map(item2 => {
                    return {
                        medioPagoId: { id: item2.MEDIO_PAGO_ID },
                        medioPagoTipoId: { id: item2.MEDIO_PAGO_TIPO_ID },
                        nombre: item2.PAGO_NAME,
                        habilitado: item2.HABILITADO,
                        siteId: item2.SITE_ID,
                        longitudPan: item2.LONGITUD_PAN,
                        formatoCvv: item2.FORMATO_CVV,
                        medioPagoTipo: {
                            medioPagoTipoId: { id: item2.MEDIO_PAGO_TIPO_ID },
                            nombre: item2.TIPO_PAGO_NAME,
                        },
                        medioPagoEntFinancs: [{
                            medioPagoEntFinancId: { id: item2.MPAGO_ENT_FINANC_ID},
                            medioPagoId: { id: item2.MEDIO_PAGO_ID },
                            entidadFinancieraId: { id: item2.ENTIDAD_FINANCIERA_ID },
                            habilitado: item2.HABILITADO,
                            bines: item2.BINES,
                            entidadFinanciera: {
                                entidadFinancieraId: { id: item2.ENTIDAD_FINANCIERA_ID },
                                nombre: item2.ENTIDAD_NAME,
                            },
                            cuotas: result3.filter(item3 => item3.MPAGO_ENT_FINANC_ID == item2.MPAGO_ENT_FINANC_ID)
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
                        }]
                    }
                })
            }
        })
        //? reemplazar la funcion de arriba por una mas eficiente para obtener los medios de pagos y cuotas de un proveedor de pagos especifico

        return res.json(data)
    } 
    catch (error) {
        console.log(error);
        res.status(500).send(
            `Ocurrió un error obteniendo pagos: ${error}`
        )   
    }
}

module.exports = { getAll2, getById }