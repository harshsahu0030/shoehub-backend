import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    brand: {
      type: String,
      required: [true, "Please enter brand"],
    },

    title: {
      type: String,
      required: [true, "Please enter title"],
      unique: true,
    },

    gender: {
      type: String,
      required: [true, "Please select gender"],
    },

    category: {
      type: String,
      required: [true, "Please select category"],
    },

    action: {
      type: String,
      required: [true, "Please select action"],
    },

    color: {
      name: {
        type: String,
        required: [true, "Please select color"],
      },
      color: {
        type: Object,
        required: true,
      },
    },

    description: {
      type: String,
      required: [true, "Please enter description"],
    },

    features: [
      {
        key: {
          type: String,
          required: [true, "Please enter key"],
        },
        value: {
          type: String,
          required: [true, "Please enter value"],
        },
      },
    ],

    mrp: {
      type: Number,
      required: [true, "Please select mrp"],
    },

    price: {
      type: Number,
      required: [true, "Please select price"],
    },

    discount: {
      type: Number,
      required: true,
    },

    sizes: [
      {
        size: {
          type: Number,
          required: true,
        },
        stock: {
          type: Number,
          maxLength: [4, "stock cannotb exceed from 4 characters"],
          required: true,
        },
      },
    ],

    numOfOrders: {
      type: Number,
      default: 0,
    },

    colors: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],

    ratingCounts: {
      1: {
        type: Number,
        default: 0,
      },
      2: {
        type: Number,
        default: 0,
      },
      3: {
        type: Number,
        default: 0,
      },
      4: {
        type: Number,
        default: 0,
      },
      5: {
        type: Number,
        default: 0,
      },
    },

    ratings: {
      type: Number,
      default: 0,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
