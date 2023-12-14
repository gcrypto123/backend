const userModel = require("./../model/user.model");
const bcrypt = require("bcryptjs");

module.exports = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!password || !email) {
      return res.status(200).json({
        status: 400,
        message: "Please provide /Email/, /password/ !!",
      });
    }
    email = email.toLowerCase();
    const user = await userModel.findOne({ email, isDeleted: false }).lean();

    if (!user) {
      return res.send({
        status: 409,
        message: "User does not exist, please register !!!",
      });
    }

    req.user = { ...user };

    // check if user account is loggin by using masterpassword

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.send({
        status: 401,
        message: "Invalid Password !!",
      });
    }
    next();
  } catch (err) {
    return res.status(500).send({
      status: 500,
      message: err.message,
    });
  }
};
