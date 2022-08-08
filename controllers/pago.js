const { getPagoDecidir, postPagoDecidir, obtenerUnPago } = require('../services/decidir');
const { getAmount, getAllAmounts } = require('../helpers/amount');
const { insertLog } = require('../helpers/logDecidir');
const { getDescription, getMontoGesDecidirLog, getGesDecidirLog } = require('../services/movimiento');
const { addGesDecidir } = require('../helpers/gesDecidir');

const estadoPago = async(req, res) => {
    let { nroTran } = req.query;
    try { 
        const getPago = await getPagoDecidir(nroTran);
        if (!getPago || getPago.length === 0) {
            // const error = 'No se encontraron pagos para el número de transacción ingresado.'
            return res.json({
                token: null,
                date: null,
                date_created: null,
                date_approved: null,
                date_last_updated: null,
                status: null,
                status_details: null,
                confirmed: null,
                pan: null,
                customer_token: null,
                card_data: null,
            });
        }
        res.status(200).json({
            message: 'Pagos obtenidos',
            data: getPago
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(`Ocurrió un error obteniendo pago: ${error}`);
    }
}
const ejecutarPago = async(req, res) => {
    const { nroTran, appOrigen } = req.query;
    const { movim, cuota, medioPago, PaymentRequestDto, nroTransacParte, monto, tipoOperacion } = req;
    try { 
        //? si tipo operacion es single: significa q es pago de 1 tarjeta y pregunto si existe monto pendiente 
        let pendiente = null
        if (tipoOperacion == 'SINGLE') {
            if (movim.pendiente) {
                pendiente = getAmount(movim, null, movim.montoPendiente);
            }
        }
        const floatAmount = getAmount(movim, null, null); 
        const montoFloat = monto 
        ? getAmount(movim, monto, null) 
        : pendiente != null 
        ? pendiente : null;
        if (floatAmount == null) {
            const error = 'No es posible ejecutar el pago debido a que no se pudo obtener el monto asociado a la transacción.'
            req.decidirLog.error = error;
            await insertLog(req.decidirLog);
            return res.status(400).send(error);
        }
        //* create long amount
        const { longAmount, montoConInteres, montoPorCuota } = 
        getAllAmounts({total: floatAmount, monto: montoFloat}, cuota.INTERES, cuota.CANTIDAD);
        //* Actualizo el intento de pago con decidir en la tabla GES_DECIDIR_LOG
        req.decidirLog.monto = montoFloat ? montoFloat : floatAmount;
        req.decidirLog.montoConInteres = montoConInteres;
        req.decidirLog.montoPorCuota = montoPorCuota;
        //* Creo el pago en decidir
        const paymentResponse = await postPagoDecidir(PaymentRequestDto, movim, longAmount, cuota.CANTIDAD, medioPago.SITE_ID, nroTransacParte);       
        // devolver payment data correctamente y si estado no es ni rejected ni approved entra aqui
        if (!paymentResponse || paymentResponse == null || paymentResponse.error != null) {
            console.log(`linea 69: `,paymentResponse);
            const error = 'Falló el proceso ejecutarPago (Decidir).'
            req.decidirLog.error = error;
            req.decidirLog.status = 'ERROR_EJECUTAR_PAGO_API_DECIDIR';
            await insertLog(req.decidirLog);
            return res.status(400).json({
                message: `error - ${paymentResponse.error}`,
                type: paymentResponse.error
            });
        }
        const statusPayment = paymentResponse.status;
        //* Status Approved
        if (statusPayment === "approved") {
            req.decidirLog.status = statusPayment;
            req.decidirLog.nroOperacion = paymentResponse.id;
            req.decidirLog.montoAPagar = floatAmount;
            req.decidirLog.descripcion = await getDescription(movim); 
            req.decidirLog.tipoOperacion = tipoOperacion;
            req.decidirLog.ticket = paymentResponse.status_details.ticket;
            req.decidirLog.nroTransacParte = nroTransacParte; 
            await insertLog(req.decidirLog);
            //* payment response
            console.log(`status: ${statusPayment}`);
            //* consultar si se completo el pago
            const montoPagado = await getMontoGesDecidirLog(nroTran)
            const montoAPagar = await getGesDecidirLog(nroTran)
            const pagoCompleto = montoPagado == montoAPagar.MONTO_A_APGAR ? true : false;
            //* insert en gesDecidir
            if (pagoCompleto) {
                await addGesDecidir(montoPagado, movim, cuota, appOrigen, tipoOperacion);
            }
            //* return response
            return res.status(200).json({
                id: parseInt(paymentResponse.id),
                status: statusPayment,
                ticket: (paymentResponse.status_details.ticket).toString(),
                nroTran: parseInt(nroTran),
                pagoCompleto: pagoCompleto,
            });
        }
        //* Caso rejected
        else{
            let paymentErrorMessage = `Mensaje de error no controlado: ${statusPayment}`
            if (statusPayment === "rejected") {
                //? salto de linea
                paymentErrorMessage =  `Pago rechazado (${statusPayment}). Detalle del error:
                Tipo: ${paymentResponse.status_details.error.type}
                Id: ${paymentResponse.status_details.error.reason.id}
                Descripción: ${paymentResponse.status_details.error.reason.description}
                Descripción adicional: ${paymentResponse.status_details.error.reason.additional_description}
                Ticket: ${paymentResponse.status_details.ticket}
                Codigo de autorización de la tarjeta: ${paymentResponse.status_details.card_authorization_code}
                Código de validación de dirección: ${paymentResponse.status_details.address_validation_code}
                `;
                //? editar ges decidir log con el error, fecha de rechazo y status
                const jsonPaymentResponse = JSON.stringify(paymentResponse);
                req.decidirLog.status = statusPayment;
                req.decidirLog.error = paymentErrorMessage;
                req.decidirLog.nroOperacion = paymentResponse.id;
                req.decidirLog.montoAPagar = floatAmount;
                req.decidirLog.descripcion = await getDescription(movim); 
                req.decidirLog.tipoOperacion = tipoOperacion;
                req.decidirLog.ticket = paymentResponse.status_details.ticket;
                req.decidirLog.nroTransacParte = nroTransacParte;
                console.log('error log: ', req.decidirLog);
                await insertLog(req.decidirLog);
                //? Se rechazo el pago por (monto), (tipo de error), con tarjeta (card_brand)
                const errorMsg = `Pago rechazado (${statusPayment}).\n
                * Se rechazo el pago por (${ montoFloat == null ? floatAmount : montoFloat }$)\n
                * ${paymentResponse.status_details.error.reason.description}\n
                `;
                return res.status(400).send(errorMsg);
            }
        }  
    } 
    catch (error) {
        console.log(error);
        res.status(400).send(`Ocurrió un error ejecutando pago: ${error}`);
    }
}

const obtenerPago = async(req, res) => {
    //? obtener del param el id del pago
    const { id } = req.params;
    try {
        const pago = await obtenerUnPago(id)
        if (!pago || pago === null) {
            const error = 'No se encontró el pago con el id ingresado.'
            return res.status(400).send(error);
        }
        res.status(200).json({
            message: 'Pago obtenido',
            data: pago
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(`Ocurrió un error obteniendo pago: ${error}`);
    }
}

module.exports = { estadoPago, ejecutarPago, obtenerPago }