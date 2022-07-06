const { getPagoDecidir, postPagoDecidir, obtenerUnPago } = require('../services/decidir');
const { getAmount, parseAmountToLong } = require('../helpers/amount');
const { calcularMontoConInteres, calcularMontoPorCuota } = require('../helpers/cuota');
const { editLog } = require('../helpers/logDecidir');
const { addGesDecidir } = require('../helpers/gesDecidir');

const getStatusPago = async(req, res) => {
    let { nroTran } = req.query;
    try { 
        const getPago = await getPagoDecidir(nroTran);
        if (!getPago || getPago.length === 0) {
            const error = 'No se encontraron pagos para el número de transacción ingresado.'
            return res.status(404).json({
                message: error
            });
        }
        res.status(200).json({
            message: 'Pagos obtenidos',
            data: getPago
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pago: ${error}`,
        });
    }
}
const ejecutarPago = async(req, res) => {
    const { nroTran, appOrigen } = req.query;
    const { movim, cuota, medioPago, PaymentRequestDto } = req;
    try { 
        const floatAmount = getAmount(movim); //? obtener el monto a pagar
        console.log(`Monto a pagar: ${floatAmount}`);
        if (floatAmount == null) {
            const error = 'No es posible ejecutar el pago debido a que no se pudo obtener el monto asociado a la transacción.'
            req.decidirLog.error = error;
            editLog(req.decidirLog);
            return res.status(404).json({
                message: error
            });
        }
        const longAmount = parseAmountToLong(floatAmount);
        const montoConInteres = calcularMontoConInteres(floatAmount, cuota.INTERES);
        const montoPorCuota = calcularMontoPorCuota(floatAmount, cuota.CANTIDAD, cuota.INTERES); 
        //* Actualizo el intento de pago con decidir en la tabla GES_DECIDIR_LOG
        req.decidirLog.monto = floatAmount;
        req.decidirLog.cantCuotas = cuota.CANTIDAD;
        req.decidirLog.interes = cuota.INTERES;
        req.decidirLog.montoConInteres = montoConInteres;
        req.decidirLog.montoPorCuota = montoPorCuota;
        req.decidirLog = editLog(req.decidirLog);
        //* Creo el pago en decidir
        const paymentResponse = await postPagoDecidir(PaymentRequestDto, movim, longAmount, cuota.CANTIDAD, medioPago.SITE_ID);       
        if (!paymentResponse || paymentResponse == null) {
            const error = 'Falló el proceso ejecutarPago (Decidir).'
            req.decidirLog.error = error;
            req.decidirLog.status = 'ERROR_EJECUTAR_PAGO_API_DECIDIR';
            editLog(req.decidirLog);
            return res.status(404).json({
                message: error
            });
        }
        const statusPayment = paymentResponse.status;
        //* Status Approved
        if (statusPayment === "approved") {
            //? agrego en ges decidir_log el pago  
            req.decidirLog.status = statusPayment;
            editLog(req.decidirLog);
            //? payment response
            const args = {
                id: paymentResponse.id,
                status: statusPayment,
                ticket: paymentResponse.status_details.ticket,
                nroTran: nroTran,
            }
            //? insertar en ges decidir el pago
            const gesDecidir = await addGesDecidir(nroTran, PaymentRequestDto, floatAmount, movim, paymentResponse, cuota, appOrigen);
            if (!gesDecidir || gesDecidir == null) {
                return res.status(404).json({
                    message: `Fallo insertando en GES_DECIDIR el pago`,
                    status: statusPayment,
                });
            }
            return res.status(200).json({
                message: 'Pago ejecutado',
                data: args
            });
        }
        //* Caso rejected
        else{
            let paymentErrorMessage = `Mensaje de error no controlado: ${statusPayment}`
            if (statusPayment === "rejected") {
                //? salto de linea
                paymentErrorMessage =  `Pago rechazado (${statusPayment}). Detalle del error: \n
                Tipo: ${paymentResponse.status_details.error.type} \n
                Id: ${paymentResponse.status_details.error.reason.id} \n
                Descripción: ${paymentResponse.status_details.error.reason.description} \n
                Descripción adicional: ${paymentResponse.status_details.error.reason.additional_description} \n
                Ticket: ${paymentResponse.status_details.ticket} \n
                Codigo de autorización de la tarjeta: ${paymentResponse.status_details.card_authorization_code} \n
                Código de validación de dirección: ${paymentResponse.status_details.address_validation_code} \n
                `;
                return res.status(404).json({
                    message: paymentErrorMessage
                });
            }
        }  
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error ejecutando pago: ${error}`,
        });
    }
}

const obtenerPago = async(req, res) => {
    //? obtener del param el id del pago
    const { id } = req.params;
    try {
        const pago = await obtenerUnPago(id)
        if (!pago || pago === null) {
            const error = 'No se encontró el pago con el id ingresado.'
            return res.status(404).json({
                message: error
            });
        }
        res.status(200).json({
            message: 'Pago obtenido',
            data: pago
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pago: ${error}`,
        });
    }

}

module.exports = { getStatusPago, ejecutarPago, obtenerPago }