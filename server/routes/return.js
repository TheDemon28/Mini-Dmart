const express = require("express");
const router = express.Router();
const returnController = require("../controllers/returnController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/my", protect, returnController.getMyReturnRequests);
router.get("/", protect, authorize("staff", "admin"), returnController.getAllReturnRequests);
router.post("/", protect, returnController.createReturnRequest);
router.patch("/:id/status", protect, authorize("staff", "admin"), returnController.updateReturnStatus);

module.exports = router;
