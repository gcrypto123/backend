const userModel = require("./../model/user.model");
module.exports = async (data) => {
  try {
    let ans = [];
    for (let i = 0; i < data.length; i++) {
      const users = await userModel.aggregate([
        { $match: { referralId: data[i].memberId } },
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ]);
      if (users.length) {
        ans.push({ memberId: data[i].memberId, total: users[0].total });
      }
    }
    return ans;
  } catch (err) {
    console.error(err);
  }
};
