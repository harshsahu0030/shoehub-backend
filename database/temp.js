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

//get user wishlist products
export const getUserWishlistProductsController = catchAsyncErrors(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id).populate("wishlist");

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist,
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

//get user cart products
export const getUserCartProductsController = catchAsyncErrors(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id).populate(
      "cart.product"
    );

    return res.status(200).json({
      success: true,
      cart: user.cart,
    });
  }
);

//add product from cart controller
export const addCartController = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  const product = await ProductModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }

  let isPresent = user.cart.find(
    (item) => item.product._id.toString() === product._id.toString()
  );

  if (isPresent) {
    return next(new ErrorHandler("Product already in your Cart", 400));
  } else {
    user.cart.push({
      quantity: req.body.quantity,
      size: req.body.size,
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
