const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const counterSchema = new Schema({
    _id:{
        type: String
    },
    seq:{
        type:Number,
        default: 100000
    }
});

const counter = mongoose.model("Counters", counterSchema,'counter');

const autoIncrement = async (id) => {
    const result = await counter.findOneAndUpdate({_id: id},{$inc:{seq:1}},{upsert:true,returnOriginal:false});
    return result;
}

module.exports = {
    autoIncrement,
    counter
}