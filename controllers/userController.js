import { config } from "dotenv";
import OtpModel from "../models/otpModel.js";
import ProductModel from "../models/productModel.js";
import UserModel from "../models/userModel.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { optGenerate } from "../utils/otpGenerate.js";
import { sendMail } from "../utils/serndMail.js";

//register verify user controller
export const registerUserController = catchAsyncErrors(
  async (req, res, next) => {
    const { email } = req.body;

    let user = await UserModel.findOne({ email });

    if (user) {
      return next(new ErrorHandler("user already exist.. please login", 400));
    }

    const otpNumber = await optGenerate();

    const subject = "Email Verification";

    const text = `Email Verification - ${otpNumber}`;

    // email, subject, text
    await sendMail(req.body.email, subject, text);

    const otp = await OtpModel.create({
      ...req.body,
      otp: otpNumber,
      expire: new Date(Date.now() + 30 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      message: `OTP successfully send to email - ${req.body.email}`,
      otp: otp._id,
    });
  }
);

//register user controller
export const registerUserVerfiedController = catchAsyncErrors(
  async (req, res, next) => {
    const optId = await OtpModel.findById(req.params.id);
    const { otp } = req.body;

    if (parseInt(otp) !== parseInt(optId.otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    if (parseInt(optId.expire) < Date.now()) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    let user = await UserModel.findOne({ email: optId.email });

    if (user) {
      return next(new ErrorHandler("user already exist.. please login", 400));
    }

    req.body.otp = null;

    user = await UserModel.create({
      name: optId.name,
      email: optId.email,
      password: optId.password,
    });

    const subject = "Thank your for registering on Shoehub";

    const text = `Thank your ${req.body.name} for registering on Shoehub`;

    // email, subject, text
    await sendMail(req.body.email, subject, text);

    const token = await user.generateJWTToken();

    await optId.deleteOne();

    // options for cookie
    const options = {
      Expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      HttpOnly: true,
      Secure: true,
      sameSite: "None",
      Domain: ".netlify.app",
    };

    return res
      .status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        message: `Welcome! ${user.name}`,
        user,
        token,
      });
  }
);

//login user controller
export const loginUserController = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please fill the inputs to login", 400));
  }

  let user = await UserModel.findOne({ email });

  if (!user) {
    return next(
      new ErrorHandler("user not exist.. please resgister first", 400)
    );
  }

  const comparePassword = await user.matchPassword(password);

  if (!comparePassword) {
    return next(new ErrorHandler("Invalid email and password", 400));
  }

  const token = await user.generateJWTToken();

  // options for cookie
  const options = {
    Expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    HttpOnly: true,
    Secure: true,
    sameSite: "None",
    Domain: ".netlify.app",
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      message: `Welcome Back! ${user.name}`,
      user,
      token,
    });
});

//load user
export const loadUserController = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);

  return res.status(200).json({
    success: true,
    user,
  });
});

//logout user controller
export const logoutUserController = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);

  // options for cookie
  const options = {
    Expires: new Date(Date.now()),
    HttpOnly: true,
    Secure: true,
    sameSite: "None",
    Domain: ".netlify.app",
  };

  res
    .status(200)
    .cookie("token", null, config)
    .json({
      success: true,
      message: `See your soon! ${user.name}`,
    });
});

//update user password controller
export const updateUserPasswordController = catchAsyncErrors(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);

    const isPasswordMatched = await user.matchPassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    res.status(200).json({ success: true, message: "password updated" });
  }
);
//----------------------------------------------------------------
//wishlist

//get user wishlist products
export const getUserWishlistProductsController = catchAsyncErrors(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id).populate("wishlist");

    return res.status(200).json({
      success: true,
      products: user.wishlist,
    });
  }
);

//add product from wishlist controller
export const addWishlistController = catchAsyncErrors(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 400));
    }

    if (user.wishlist.includes(product._id)) {
      return next(new ErrorHandler("Product already in your Wishlist", 400));
    } else {
      //push product in wishlist array
      user.wishlist.push(product._id);

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product added in your Wishlist",
      });
    }
  }
);

// remove product from wishlist controller
export const removeWishlistController = catchAsyncErrors(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 400));
    }

    let index = -1;

    if (user.wishlist.includes(product._id)) {
      //remove the product from array
      index = user.wishlist.indexOf(product._id);
      user.wishlist.splice(index, 1);

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from your Wishlist",
      });
    } else {
      return next(new ErrorHandler("Product not found in your Wishlist", 400));
    }
  }
);

//----------------------------------------------------------------
//cart

//get user cart products
export const getUserCartProductsController = catchAsyncErrors(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id).populate(
      "cart.product"
    );

    return res.status(200).json({
      success: true,
      products: user.cart,
    });
  }
);

//add product from cart controller
export const addCartController = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  const product = await ProductModel.findById(req.params.id);

  const { size, quantity } = req.body;

  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }

  let isPresent = user.cart.find(
    (item) => item.product._id.toString() === product._id.toString()
  );

  if (isPresent) {
    return next(new ErrorHandler("Product already in your Cart", 400));
  } else if (!size || !quantity) {
    return next(
      new ErrorHandler("Please Select size before adding to Cart.", 400)
    );
  } else {
    user.cart.push({
      quantity: quantity,
      size: size,
      product: product._id,
    });
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to your Cart",
    });
  }
});

// remove product from cart controller
export const removeCartController = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  const product = await ProductModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }

  let index = -1;

  user.cart.find((item, i) => {
    item.product._id.toString() === product._id.toString();
    index = i;
  });

  if (index !== -1) {
    user.cart.splice(index, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from your Cart",
    });
  } else {
    return next(new ErrorHandler("Product not found in your Cart", 400));
  }
});
