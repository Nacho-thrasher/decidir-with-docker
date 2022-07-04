const { getPagoDecidir, postPagoDecidir } = require('../services/decidir');
const { getAmount, parseAmountToLong } = require('../helpers/amount');
const { calcularMontoConInteres, calcularMontoPorCuota } = require('../helpers/cuota');
const { editLog } = require('../helpers/logDecidir');
const { addGesDecidir } = require('../helpers/gesDecidir');
// import ITransaction from '../db/models/ITransaction';
const getStatusPago = async(req, res) => {
    let { nroTran } = req.query;
    try { //? resolve nro transac float
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
        console.log('aqui',error);
        res.status(500).json({
            message: `Ocurrió un error obteniendo pago: ${error}`,
        });
    }
}
const ejecutarPago = async(req, res) => {
    const { nroTran, appOrigen } = req.query;
    const { movim, cuota, medioPago, PaymentRequestDto } = req;
    try { //! paymentReq modelo de datos de pago
        //? ges decidir log es add, va agregando los movimientos
        const floatAmount = getAmount(movim);
        if (floatAmount == null || floatAmount.length == 0) {
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
        console.log('longAmount', longAmount);
        //? Actualizo el intento de pago con decidir en la tabla GES_DECIDIR_LOG
        req.decidirLog.monto = floatAmount;
        req.decidirLog.cantCuotas = cuota.CANTIDAD;
        req.decidirLog.interes = cuota.INTERES;
        req.decidirLog.montoConInteres = montoConInteres;
        req.decidirLog.montoPorCuota = montoPorCuota;
        req.decidirLog = editLog(req.decidirLog);
        
        const paymentResponse = await postPagoDecidir(PaymentRequestDto, movim, longAmount, cuota.CANTIDAD, medioPago.SITE_ID);       
        if (!paymentResponse || paymentResponse.length === 0) {
            const error = 'Falló el proceso ejecutarPago (Decidir).'
            req.decidirLog.error = error;
            req.decidirLog.status = 'ERROR_EJECUTAR_PAGO_API_DECIDIR';
            editLog(req.decidirLog);
            return res.status(404).json({
                message: error
            });
        }
        const statusPayment = paymentResponse.status;
        if (statusPayment === "approved") {
            //? agrego en ges decidir log el pago  
            req.decidirLog.status = statusPayment;
            editLog(req.decidirLog);
            //? payment response
            const args = {
                id: paymentResponse.id,
                ticket: paymentResponse.status_details.ticket,
                nroTran: nroTran,
            }
            //? insertar en ges decidir log el pago
            const gesDecidir = await addGesDecidir(nroTran, PaymentRequestDto, floatAmount, movim, paymentResponse, cuota, appOrigen );
            if (!gesDecidir) {
                return res.status(404).json({
                    message: `Fallo insertando en GES_DECIDIR el pago`
                });
            }
            return res.status(200).json({
                message: 'Pago ejecutado',
                data: args
            });
        }
        //? caso rejected
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
module.exports = {
    getStatusPago,
    ejecutarPago
}