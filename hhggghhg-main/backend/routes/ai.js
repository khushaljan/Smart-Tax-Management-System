const express = require("express");
const { calculateTax, taxAssistant } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/calculate-tax", protect, calculateTax);
router.post("/tax-assistant", protect, taxAssistant);

module.exports = router;
