import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter your name"],
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: "Email address is required",
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },

  password: {
    type: String,
    required: true,
    minLength: [5, "password must be at least 5 characters"],
  },

  role: {
    type: String,
    default: "user",
  },

  wishlist: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],

  cart: [
    {
      size: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    },
  ],

  address: {
    name: {
      type: String,
      requires: true,
    },
    contact: {
      type: Number,
      requires: true,
    },
    street: {
      type: String,
      requires: true,
    },
    city: {
      type: String,
      requires: true,
    },
    state: {
      type: String,
      requires: true,
    },
    pincode: {
      type: Number,
      requires: true,
    },
  },

  otp: Number,
  otpExpire: Date,
});

//hash password (using bcrypt)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//compare password
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//generate JWT token
userSchema.methods.generateJWTToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

export default mongoose.model("User", userSchema);
