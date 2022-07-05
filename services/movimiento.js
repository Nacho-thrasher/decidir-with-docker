const { consulta } = require('../index');
const { getMarcaReinscripcionFicha, devolverMaestro } = require('../services/mercadoPago');

const getByNroTran = async(nroTran) => {
    try {
        //? tmb consultar a ges-decidir para ver si el movimiento existe
        let q = `SELECT * FROM GES_MOVIMS_COD_BARRA2 
                WHERE NRO_TRANSAC = ${nroTran}`;
        
        const result = await consulta(q);
        if (result.length == 0) return null;
        if (result == null) return null;
        
        return result[0];
        
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getDescription = async(movim) => {
    if (movim == null) return '';
    let modalidad = ''
    const marcaReinscripcionFicha = await getMarcaReinscripcionFicha(movim.TDOCU, movim.NDOCU, movim.LUGAR, movim.SECTOR, movim.CARRERA, movim.MODO);
    if (marcaReinscripcionFicha != null) {
        modalidad = marcaReinscripcionFicha
        console.log('marcaReinscripcionFicha aqui', marcaReinscripcionFicha);
    }
    else{
        const maestro = await devolverMaestro(movim.TDOCU, movim.NDOCU, movim.LUGAR, movim.SECTOR, movim.CARRERA, movim.MODO);
        if (maestro != null) {
            console.log('maestro aqui', maestro);
            if (maestro.MARCA_INS != null) {
                modalidad = maestro.MARCA_INS
            }    
        }
    }
    console.log('modalidad', modalidad);
    //? descripcion del movimiento append pago sag 
    let descripcion =  `PAGO SAG - ${modalidad} - ${movim.LUGAR} - ${movim.SECTOR} - ${movim.CARRERA} - ${movim.MODO}
    - ${movim.TDOCU} - ${movim.NDOCU} - ${movim.NRO_COMP1} - ${movim.NRO_COMP2}`;

    return descripcion;

}

module.exports = { getByNroTran, getDescription }
