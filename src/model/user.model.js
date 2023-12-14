const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    referralId: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    memberId: { type: String },
    role: { type: String, enum: ["admin", "user"] , default:"user"},
    balance : {type : Number, default:0},
    isUpgraded : {type: Boolean, default: false},
    partOfMatrix : {type: Boolean, default:false},
    matrixNumber:{type: Number}

  },
  { timestamps: true }
);

module.exports = model("Users", userSchema);
