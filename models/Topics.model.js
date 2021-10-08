const mongoose = require("mongoose");
const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  subjectName: {
    type: String,
    required: true
  },

  videoLink:{
    type: String,
    required: true
  }
  
});

const Topics = mongoose.model("Topics", TopicSchema);
module.exports = Topics;