const router = require("express").Router();
const {
  estadoPago,
  ejecutarPago,
  obtenerPago,
  ejecutarPagoParte
} = require("../controllers/pago");
const { validarMovims }     = require("../middlewares/validarMovims");
const { validarMedioPago }  = require("../middlewares/validarMedioPago");
const { validarCuotas }     = require("../middlewares/validarCuotas");
const { validarBody }       = require("../middlewares/validarBody");
const { validarNroTarjeta } = require("../middlewares/validarNroTarjeta");

router.get("/", estadoPago);
router.post(
  "/",
  [validarBody, validarMovims, validarMedioPago, validarCuotas, validarNroTarjeta],
  ejecutarPago
);

router.get("/:id", obtenerPago);

module.exports = router;
