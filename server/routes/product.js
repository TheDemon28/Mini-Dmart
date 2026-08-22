const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Protected: staff or admin can create/update/delete
router.post("/", protect, authorize("staff", "admin"), productController.createProduct);
router.put("/:id", protect, authorize("staff", "admin"), productController.updateProduct);
router.delete("/:id", protect, authorize("staff", "admin"), productController.deleteProduct);

module.exports = router;
