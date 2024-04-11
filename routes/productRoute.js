import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";
import {
  addReviewOnProductController,
  createProductController,
  deleteProductController,
  deleteReviewOnProductController,
} from "../controllers/productController.js";

const router = express.Router();

//admin
router
  .route("/admin/products/create")
  .post(isAuthenticated, authorizeRoles("admin"), createProductController);

//admin
router
  .route("/admin/products/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProductController);

//both


//user
router
  .route("/product/review/:id")
  .put(isAuthenticated, addReviewOnProductController)
  .delete(isAuthenticated, deleteReviewOnProductController);

export default router;
