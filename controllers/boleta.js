const { getBoletaById } = require('../services/boleta');	

const getBoleta = async(req, res) => {
    let { nroTran } = req.query;
    try { 
        const movim = await getBoletaById(nroTran);
        if (!movim) {
            return res.status(404).json({
                message: 'No existe la boleta correspondiente al número de transacción ingresado.'
            });
        }
        const boleta = {
            gesMovimsCodBarra2PK: {
                nroComp1: movim.NRO_COMP1,
                nroComp2: movim.NRO_COMP2,
                tdocu: movim.TDOCU,
                ndocu: movim.NDOCU,
                lugar: movim.LUGAR,
                sector: movim.SECTOR,
                carrera: movim.CARRERA,
                modo: movim.MODO,
                concepto: movim.CONCEPTO,
                fecAplic: movim.FEC_APLIC,
            },
            debe1: movim.DEBE1,
            debe2: movim.DEBE2,
            fvto1: movim.FVTO1,
            fvto2: movim.FVTO2,
            txtConcepto: movim.TXT_CONCEPTO,
            codBar: movim.COD_BAR,
            username: movim.USERNAME,
            terminal: movim.TERMINAL,
            fechaModif: movim.FECHA_MODIF,
            nroTransac: movim.NRO_TRANSAC,
            total1: movim.TOTAL1,
            total2: movim.TOTAL2,
            enviado: movim.ENVIADO,
            enviadoLink: movim.ENVIADO_LINK,
            enviadoVisa: movim.ENVIADO_VISA,
            nroVisa: movim.NRO_VISA,
        }  
        res.status(200).json(boleta);
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