const mongoose = require("mongoose");
const TopicSchema = new mongoose.Schema({
  subjectname: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  
});

const Topics = mongoose.model("TopicsTable", TopicSchema);
module.exports = Topics;