const { getPagoDecidir, postPagoDecidir, obtenerUnPago } = require('../services/decidir');
const { getAmount, parseAmountToLong } = require('../helpers/amount');
const { calcularMontoConInteres, calcularMontoPorCuota } = require('../helpers/cuota');
const { insertLog } = require('../helpers/logDecidir');
const { getDescription } = require('../services/movimiento');
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
    const { movim, cuota, medioPago, PaymentRequestDto } = req;
    try { 
        //* si existe monto pendiente, se debe calcular el monto a pagar
        let pendiente = null
        if (movim.pendiente) {
            pendiente = getAmount(movim, null, null, movim.montoPendiente);
        }
        const floatAmount = getAmount(movim, null, null, null); 
        if (floatAmount == null) {
            const error = 'No es posible ejecutar el pago debido a que no se pudo obtener el monto asociado a la transacción.'
            req.decidirLog.error = error;
            await insertLog(req.decidirLog);
            return res.status(400).send(error);
        }
        //* create long amount
        const longAmount = pendiente != null ? parseAmountToLong(pendiente) : parseAmountToLong(floatAmount);
        const montoConInteres = calcularMontoConInteres(floatAmount, cuota.INTERES);
        const montoPorCuota = calcularMontoPorCuota(floatAmount, cuota.CANTIDAD, cuota.INTERES); 
        //* Actualizo el intento de pago con decidir en la tabla GES_DECIDIR_LOG
        req.decidirLog.monto = floatAmount;
        req.decidirLog.montoConInteres = montoConInteres;
        req.decidirLog.montoPorCuota = montoPorCuota;
        //* Creo el pago en decidir
        const paymentResponse = await postPagoDecidir(PaymentRequestDto, movim, longAmount, cuota.CANTIDAD, medioPago.SITE_ID);       
        if (!paymentResponse || paymentResponse == null || paymentResponse.error != null) {
            const error = 'Falló el proceso ejecutarPago (Decidir).'
            req.decidirLog.error = error;
            req.decidirLog.status = 'ERROR_EJECUTAR_PAGO_API_DECIDIR';
            await insertLog(req.decidirLog);
            return res.status(400).json({
                message: error,
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
            req.decidirLog.tipoOperacion = 'SINGLE';
            req.decidirLog.ticket = paymentResponse.status_details.ticket;
            req.decidirLog.nroTransacParte = movim.pendiente ? `${(nroTran).toString()}-2` : `${(nroTran).toString()}-1`; 
            await insertLog(req.decidirLog);
            //* payment response
            console.log(`status: ${statusPayment}`, req.decidirLog);
            return res.status(200).json({
                id: parseInt(paymentResponse.id),
                status: statusPayment,
                ticket: (paymentResponse.status_details.ticket).toString(),
                nroTran: parseInt(nroTran)
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
                //? editar ges decidir log con el error, fecha de rechazo y status
                //? Gson gson = new Gson(); similar a JSON.stringify(paymentResponse.status_details.error)
                const jsonPaymentResponse = JSON.stringify(paymentResponse);
                req.status = statusPayment;
                req.error = jsonPaymentResponse != null ? jsonPaymentResponse : paymentErrorMessage;
                await insertLog(req.decidirLog);

                return res.status(400).send(paymentErrorMessage);
            }
        }  
    } 
    catch (error) {
        console.log(error);
        res.status(500).send(`Ocurrió un error ejecutando pago: ${error}`);
    }
}
const ejecutarPagoParte = async (req, res) => {
    const { nroTran, appOrigen, firstAmount, secondAmount, nroTransacParte } = req.query;
    const { movim, cuota, medioPago, PaymentRequestDto } = req;
    try {
        //* si existe monto pendiente 
        // let pendiente = null
        // if (movim.pendiente) {
        //     pendiente = getAmount(movim, null, null, movim.montoPendiente);
        // }
        //* nro tarjetas
        const tarjetaNro = nroTransacParte.split('-')[1]
        if (tarjetaNro == null || tarjetaNro == '') {
            const error = 'No es posible ejecutar el pago debido a que no se pudo obtener el nro de tarjeta asociado a la transacción.'
            req.decidirLog.error = error;
            await insertLog(req.decidirLog);
            return res.status(400).send(error);
        }
        const floatAmount = getAmount(movim, null, null, null); 
        const firstFloatAmount = firstAmount ? getAmount(null, firstAmount, null, null) : null;
        const secondFloatAmount = secondAmount ? getAmount(null, firstAmount, secondAmount, null) : null;
        if (floatAmount == null) {
            const error = 'No es posible ejecutar el pago debido a que no se pudo obtener el monto asociado a la transacción.'
            req.decidirLog.error = error;
            await insertLog(req.decidirLog);
            return res.status(400).send(error);
        }
        //* calcular montos con tarjeta 1 o 2
        const firstLongAmount = firstFloatAmount ? parseAmountToLong(firstFloatAmount) : null;
        const firstMontoConInteres = firstFloatAmount ? calcularMontoConInteres(firstFloatAmount, cuota.INTERES) : null;
        const firstMontoPorCuota = firstFloatAmount ? calcularMontoPorCuota(firstFloatAmount, cuota.CANTIDAD, cuota.INTERES) : null;
        const secondLongAmount = secondFloatAmount ? parseAmountToLong(secondFloatAmount) : null;
        const secondMontoConInteres = secondFloatAmount ? calcularMontoConInteres(secondFloatAmount, cuota.INTERES) : null;
        const secondMontoPorCuota = secondFloatAmount ? calcularMontoPorCuota(secondFloatAmount, cuota.CANTIDAD, cuota.INTERES) : null;
        //* setear montos con tarjeta 1 o 2
        req.decidirLog.monto = tarjetaNro == 1 ? firstFloatAmount : secondFloatAmount; 
        req.decidirLog.montoConInteres = tarjetaNro == 1 ? firstMontoConInteres : secondMontoConInteres; 
        req.decidirLog.montoPorCuota = tarjetaNro == 1 ? firstMontoPorCuota : secondMontoPorCuota; 
        const setLongAmount = tarjetaNro == 1 ? firstLongAmount : secondLongAmount;
        //* ejecutar pago con tarjeta 1 o 2
        const paymentResponse = await postPagoDecidir(PaymentRequestDto, movim, setLongAmount, cuota.CANTIDAD, medioPago.SITE_ID, nroTransacParte);       
        if (!paymentResponse || paymentResponse == null || paymentResponse.error != null) {
            const error = 'Falló el proceso ejecutarPago (Decidir).'
            req.decidirLog.error = error;
            req.decidirLog.status = 'ERROR_EJECUTAR_PAGO_API_DECIDIR';
            await insertLog(req.decidirLog);
            return res.status(400).json({
                message: error,
                type: paymentResponse.error
            });
        }
        //* Status Approved
        const statusPayment = paymentResponse.status;
        if (statusPayment === "approved") {
            req.decidirLog.status = statusPayment;
            req.decidirLog.nroOperacion = paymentResponse.id, //? id decidir
            req.decidirLog.montoAPagar = floatAmount, //? monto total 
            req.decidirLog.descripcion = await getDescription(movim); 
            req.decidirLog.tipoOperacion = 'DISTRIBUTED';
            req.decidirLog.ticket = paymentResponse.status_details.ticket, //? ticket decidir
            req.decidirLog.nroTransacParte = nroTransacParte; //? 2 tarjetas 
            await insertLog(req.decidirLog);
            if (tarjetaNro == '2') {
                console.log(`entro segundo pago`)
                //? comprobar montos con tarjeta 1 y 2
            }
            return res.status(200).json({
                id: parseInt(paymentResponse.id),
                status: statusPayment,
                ticket: (paymentResponse.status_details.ticket).toString(),
                nroTran: parseInt(nroTran),
                tarjetaNro: tarjetaNro
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
                const jsonPaymentResponse = JSON.stringify(paymentResponse);
                req.status = statusPayment;
                req.error = jsonPaymentResponse != null ? jsonPaymentResponse : paymentErrorMessage;
                await insertLog(req.decidirLog);
                return res.status(400).send(paymentErrorMessage);
            }
        }  

    } catch (error) {
        console.log(error);
        res.status(500).send(`Ocurrió un error ejecutando pago: ${error}`);
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

module.exports = { estadoPago, ejecutarPago, obtenerPago, ejecutarPagoParte }