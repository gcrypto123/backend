const express = require("express");
const router = express.Router();
const userCtrl = require("../controller/user.controller");
const {
  checkIfUserExists,
  checkIfUserExistsOrNot,
} = require("./../middleware/index");

// register a new user
router.post("/register", checkIfUserExists, userCtrl.register);

// login a user
router.post("/login", checkIfUserExistsOrNot, userCtrl.login);

// upgrade a user api
// user will have to pay 260 trx or the same amount will be deducted from users account
router.post("/upgrade", userCtrl.upgrade);

// list of all robot income of all sponsers
router.get("/robotIncome", userCtrl.robotIncome);
router.get("/upgradedUsers", userCtrl.upgradedUsers);

module.exports = router;
