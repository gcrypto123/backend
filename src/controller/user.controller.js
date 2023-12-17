const userModel = require("../model/user.model");
const { autoIncrement } = require("./../model/counter.model");
const { counter } = require("./../model/counter.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");

exports.register = async (req, res) => {
  const { email, mobile, password, referralId, role } = req.body;
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
      memberId: serialNo["seq"],
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
      memberId: req.user.memberId,
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

exports.upgrade = async (req, res) => {
  try {
    // get the referralID which has to be updgraded
    // 560 trx upgrade if bal is not available then payment else deduct it from users account
    // amount has to be distributed as per the dividend ratio
    let memberId = req.body.memberId;
    let companyId = "100000";

    const user = await userModel.findOneAndUpdate(
      { memberId },
      { $set: { isUpgraded: true } }
    );

    if (user) {
      // get the sponser id from the user data and update its balance by 60% of 250 and 35% of 250 to higher level, remaining 5% to highest one
      // condition is their balance has to be less than or equal to 200 trx
      let userMemberID = Number(memberId) - 1,
        remTRX = 0,
        dividendValue = [
          0.1, 0.07, 0.05, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01,
        ],
        dividendSum = 0.35,
        i = 0;
      let dividendAmount = 250;

      // 100004
      
      while (userMemberID !== "100000" && i < 10 && userMemberID !== 100000) {
        // for sponser commission is 60%
        
        console.log("memberID: ", userMemberID);

        remTRX = dividendAmount * dividendValue[i];

        dividendSum = dividendSum - dividendValue[i];

        // if (userMemberID.toString() !== "100000") {
        let refId = await userModel.findOneAndUpdate(
          {
            memberId: userMemberID.toString()
          },
          { $inc: { balance: remTRX } }
        );
       
        if (refId) {
          i++;
        } else {
          dividendSum += dividendValue[i];
        }

        userMemberID = Number(userMemberID) - 1;
      }
      // }
      // amount getting added in the company account for every successful upgrade
      console.log("dividendAmount",dividendAmount,dividendSum)
      if (user.referralId === "100000") {
        let amount = 10 + 250 * 0.6 + dividendAmount * dividendSum;
        await userModel.findOneAndUpdate(
          { memberId: companyId },
          { $inc: { balance: amount } }
        );
      } else {
        let amount = dividendAmount * dividendSum + 10;
        await userModel.findOneAndUpdate(
          { memberId: companyId },
          { $inc: { balance: amount } }
        );

        amount = 250 * 0.6;
        // here 60% will get added to the sponser account
        await userModel.findOneAndUpdate(
          { memberId: user.referralId },
          { $inc: { balance: amount } }
        );
      }
    }
    
    return res.send({ message: "Account upgraded successfully !" });
  } catch (err) {
    console.log(err);
  }
};

exports.robotIncome = async (req, res) => {
  try {
    let sponsers = await userModel
      .find({ memberId: { $ne: "100000" }, isDeleted: false })
      .select({ memberId: 1, _id: 0, robotIncome: 1, createdAt: 1 })
      .lean();

    sponsers.map((e) => {
      e["createdAt"] = moment(e["createdAt"]).format("YYYY-MM-DD");
      e["robotIncome"] =
        e["robotIncome"] == null && e["robotIncome"] == undefined
          ? "0.00"
          : e["robotIncome"].toFixed(2);
    });
    return res.send({
      message: "Robot Income successfully fetched !",
      data: sponsers,
    });
  } catch (e) {
    return res.status(500).send({ status: 500, message: err.message });
  }
};

// list of all upgraded users
exports.upgradedUsers = async (req, res) => {
  try {
    let sponsers = await userModel
      .find({ memberId: { $ne: "100000" }, isUpgraded: true, isDeleted: false })
      .select({
        memberId: 1,
        _id: 0,
        isUpgraded: 1,
        createdAt: 1,
        referralId: 1,
      })
      .lean();

    sponsers.map((e) => {
      e["createdAt"] = moment(e["createdAt"]).format("DD-MM-YYYY");
      e["upgradeAmount"] = 260;
    });
    return res.send({
      message: "Upgraded users !",
      data: sponsers,
    });
  } catch (e) {
    return res.status(500).send({ status: 500, message: err.message });
  }
};
