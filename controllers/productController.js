import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import ProductModel from "../models/productModel.js";
import UserModel from "../models/userModel.js";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/errorHandler.js";
import productModel from "../models/productModel.js";
import ApiFeatures from "../utils/apiFeatures.js";

//---------------------------------------------------------------
//admin

//create product
export const createProductController = catchAsyncErrors(
  async (req, res, next) => {
    let { mrp, price, images } = req.body;

    let discount = Math.floor(((mrp - price) / mrp) * 100);

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      let result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;

    let product = await ProductModel.create({
      ...req.body,
      user: req.user._id,
      discount,
    });

    res.status(201).json({
      success: true,
      message: "Product created",
      product,
    });
  }
);

//update product
export const updateProductController = catchAsyncErrors(
  async (req, res, next) => {
    let product = await ProductModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let { mrp, price } = req.body;

    let discount = Math.floor(((mrp - price) / mrp) * 100);

    product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        user: req.user._id,
        discount,
      },

      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(201).json({
      success: true,
      message: "Product updated",
      product,
    });
  }
);

// Delete Product
export const deleteProductController = catchAsyncErrors(
  async (req, res, next) => {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  }
);

//---------------------------------------------------------------
//both
export const getProductsController = catchAsyncErrors(
  async (req, res, next) => {
    const resultPerPage = req.query.limit ? req.query.limit : 10;
    const productsCount = await ProductModel.countDocuments();

    let apiFeature = new ApiFeatures(ProductModel.find(), req.query)
      .search()
      .multiFilters()
      .filter();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature = new ApiFeatures(ProductModel.find(), req.query)
      .search()
      .multiFilters()
      .filter()
      .pagination(resultPerPage);

    if (req.query.sort) {
      let sort = req.query.sort.split(",")[0];
      let sort01 = parseInt(req.query.sort.split(",")[1]);

      products = await apiFeature.query.sort([[sort, sort01]]);
    } else {
      products = await apiFeature.query;
    }

    res.status(200).json({
      success: true,
      productsCount,
      resultPerPage,
      filteredProductsCount,
      queries: req.query,
      products,
    });
  }
);

export const getProductController = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//---------------------------------------------------------------
//user

//product rating counts
function productRatingCounts(product) {
  product.ratingCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  product.reviews
    .map((item) => item.rating)
    .forEach((element) => {
      product.ratingCounts[element] = product.ratingCounts[element]
        ? product.ratingCounts[element] + 1
        : 1;
    });
}

//average rating
function averageRating(product) {
  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let result =
    avg / (product.reviews.length === 0 ? 1 : product.reviews.length);

  product.ratings = parseFloat(result.toFixed(1));
}

//add and update review on product
export const addReviewOnProductController = catchAsyncErrors(
  async (req, res, next) => {
    let product = await ProductModel.findById(req.params.id);
    const user = await UserModel.findById(req.user._id);

    const { rating, comment } = req.body;

    const review = {
      user: user._id,
      name: user.name,
      rating,
      comment,
    };

    if (!product) {
      return next(new ErrorHandler("product not found", 400));
    }

    //checking for owner of the product
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    //rating counts
    productRatingCounts(product);

    //average ratings
    averageRating(product);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review updated",
    });
  }
);

//delete review on product
export const deleteReviewOnProductController = catchAsyncErrors(
  async (req, res, next) => {
    let product = await ProductModel.findById(req.params.id);
    const user = await UserModel.findById(req.user._id);

    if (!product) {
      return next(new ErrorHandler("product not found", 400));
    }
    //checking for owner of the product
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev, i) => {
        if (rev.user.toString() === req.user._id.toString()) {
          product.reviews.splice(i);
          product.numOfReviews = product.reviews.length;
        }
      });
    } else {
      return next(new ErrorHandler("not authorized", 400));
    }

    //rating counts
    productRatingCounts(product);

    //average ratings
    averageRating(product);

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  }
);
