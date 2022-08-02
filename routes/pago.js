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

router.get("/", estadoPago);
router.post(
  "/",
  [validarBody, validarMovims, validarMedioPago, validarCuotas],
  ejecutarPago
);
router.post(
  "/parte", 
  [validarBody, validarMovims, validarMedioPago, validarCuotas],
  ejecutarPagoParte  
);

router.get("/:id", obtenerPago);

module.exports = router;
