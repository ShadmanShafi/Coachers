const mongoose = require("mongoose");
const quizDataSchema = new mongoose.Schema({
  email:{
    type: String,
    required: true
  },
  quiz:[]
});

const quizData = mongoose.model("quiz_data", quizDataSchema);


module.exports = {quizData};
