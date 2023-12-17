const cron = require("node-cron");
const { getUserData, getRobotIncome } = require("./middleware/index");
const userModel = require("./model/user.model");

exports.robotIncomeSponsers = async (req, res) => {
  try {
    cron.schedule("0 1 * * *", async () => {
      console.log(
        "\x1b[93m CRON TO UPDATE ROBOT INCOME IN DB | CRON START \x1b[0m"
      );
      const userData = await getUserData();

      let robotIncome = await getRobotIncome(userData);
     
      for (let i = 0; i < robotIncome.length; i++) {
        let income = robotIncome[i]["total"];
        let member_Id = robotIncome[i]["memberId"];
        income = income * 0.1;
        if (income > 0) {
          await userModel.findOneAndUpdate(
            { memberId: member_Id },
            { $set: { robotIncome: income } }
          );
        }
      }

      console.log("\x1b[93m ROBOT INCOME IS UPDATED || CRON JOB \x1b[0m");
    });
  } catch (err) {
    console.error(err);
  }
};
