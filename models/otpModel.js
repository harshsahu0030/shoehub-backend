import mongoose from "mongoose";

const otpModel = new mongoose.Schema({
  otp: {
    type: Number,
    requred: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  contact: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expire: {
    type: Date,
  },
});

export default mongoose.model("OTP", otpModel);
