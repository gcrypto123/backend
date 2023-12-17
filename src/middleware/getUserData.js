const userModel = require("./../model/user.model");
module.exports = async () => {
  try {
    const users = await userModel
      .find({ memberId: { $ne: "100000" } })
      .select({ memberId: 1, _id: 0 })
      .lean();
    return users;
  } catch (err) {
    console.error(err);
  }
};
