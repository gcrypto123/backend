const userModel = require("./../model/user.model");

module.exports = async (req,res,next) => {
    let email = req.body.email;

    try {
          // get the user data from DB
    let isUserExists = await userModel.findOne({email,isDeleted:false});
    
    if(isUserExists) {
        return res.send({message: 'User already exists, please try with a different email'});
    }else {
        return next();
    }
    }catch(err) {
        return res.send({message: err.message});
    }
  
}