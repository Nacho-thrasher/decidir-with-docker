const router = require("express").Router();

const { getPromocionesByEntFinanc } = require("../controllers/promociones");

router.get("/:id", getPromocionesByEntFinanc);

module.exports = router;