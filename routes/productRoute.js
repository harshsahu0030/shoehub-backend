import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";
import {
  addReviewOnProductController,
  createProductController,
  deleteProductController,
  deleteReviewOnProductController,
  getProductController,
  getProductsController,
  updateProductController,
} from "../controllers/productController.js";

const router = express.Router();

//admin
router
  .route("/admin/products/create")
  .post(isAuthenticated, authorizeRoles("admin"), createProductController);

//admin
router
  .route("/admin/products/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateProductController)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProductController);

//both
router.route("/products").get(getProductsController);

router.route("/product/:id").get(getProductController);

//user
router
  .route("/product/review/:id")
  .put(isAuthenticated, addReviewOnProductController)
  .delete(isAuthenticated, deleteReviewOnProductController);

export default router;
