const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/my", protect, orderController.getMyOrders);
router.get("/", protect, authorize("staff", "admin"), orderController.getAllOrders);
router.post("/", protect, orderController.createOrder);
router.patch("/:id/status", protect, authorize("staff", "admin"), orderController.updateOrderStatus);

module.exports = router;
