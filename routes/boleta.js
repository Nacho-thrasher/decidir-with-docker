const router = require("express").Router();
const { getBoleta } = require("../controllers/boleta");

router.get("/", getBoleta);

module.exports = router;
