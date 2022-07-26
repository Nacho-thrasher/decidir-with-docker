const router = require("express").Router();
const {
  getStatusPago,
  ejecutarPago,
  obtenerPago,
} = require("../controllers/pago");
const { validarMovims } = require("../middlewares/validarMovims");
const { validarMedioPago } = require("../middlewares/validarMedioPago");
const { validarCuotas } = require("../middlewares/validarCuotas");
const { validarBody } = require("../middlewares/validarBody");

router.get("/", getStatusPago);
router.post(
  "/",
  [validarBody, validarMovims, validarMedioPago, validarCuotas],
  ejecutarPago
);
router.get("/:id", obtenerPago);

module.exports = router;
