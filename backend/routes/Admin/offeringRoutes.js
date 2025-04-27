const express = require("express");
const router = express.Router();
const offeringController = require("../../controllers/Admin/offeringController");

router.post("/", offeringController.createOffering);

module.exports = router;
