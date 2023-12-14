const userModel = require("../model/user.model");
const { autoIncrement } = require("./../model/counter.model");
const { counter } = require("./../model/counter.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, mobile, password, referralId,role } = req.body;
  try {
    let serialNo = await autoIncrement("users");
    if (serialNo["seq"] == 1) {
      serialNo["seq"] = 100000;
      await counter.findOneAndUpdate(
        { _id: "users" },
        { $set: { seq: serialNo["seq"] } }
      );
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT));
    const hashPassword = bcrypt.hashSync(password, salt);

    const isCreated = new userModel({
      email: email.toLowerCase(),
      password: hashPassword,
      mobile: mobile,
      referralId: referralId,
      memberId: serialNo["seq"]
    });
    const user = await isCreated.save();
    if (user) {
      // adding 10 percent to the admin account (company)
      let value = 10,
        companyAmount = 100,
        total = 0;
      if (referralId === "100000") {
        total = value + companyAmount;
        await userModel.findOneAndUpdate(
          { memberId: "100000" },
          { $inc: { balance: total } }
        );
      } else {
        await userModel.findOneAndUpdate(
          { memberId: "100000" },
          { $inc: { balance: value } }
        );
        await userModel.findOneAndUpdate(
          { memberId: referralId },
          { $inc: { balance: companyAmount } }
        );
      }
    }

    return res.send({ message: "User created successfully", data: user });
  } catch (err) {
    return res.send({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("---- login user ----");

    // console.log("========>", req.body.location)

    const payload = {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "24h" });
    // console.log(token,"=====>");

    payload["token"] = token;
    if (token) {
      return res.send({
        status: 200,
        message: "User logged in successfully",
        data: payload,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: 500, message: err.message });
  }
};
