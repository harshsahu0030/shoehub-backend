import express from "express";
import {
  addCartController,
  addWishlistController,
  getUserCartProductsController,
  getUserWishlistProductsController,
  loadUserController,
  loginUserController,
  logoutUserController,
  registerUserController,
  registerUserVerfiedController,
  removeCartController,
  removeWishlistController,
  updateUserPasswordController,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).json({
    success: true,
    message: "Shoehub API",
  });
});

//authentication
router.route("/register").post(registerUserController);

router.route("/register/:id").post(registerUserVerfiedController);

router.route("/login").post(loginUserController);

router.route("/load").get(isAuthenticated, loadUserController);

router.route("/logout").get(isAuthenticated, logoutUserController);

router
  .route("/update/password")
  .put(isAuthenticated, updateUserPasswordController);

//wishlist
router
  .route("/wishlist")
  .get(isAuthenticated, getUserWishlistProductsController);

router.route("/wishlist/add/:id").get(isAuthenticated, addWishlistController);

router
  .route("/wishlist/remove/:id")
  .get(isAuthenticated, removeWishlistController);

//cart
router.route("/cart").get(isAuthenticated, getUserCartProductsController);

router.route("/cart/add/:id").post(isAuthenticated, addCartController);

router.route("/cart/remove/:id").get(isAuthenticated, removeCartController);

export default router;
