const mongoose = require("mongoose");
const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Types.ObjectId, ref: 'subjects',
  }
  
});

const Topics = mongoose.model("Topics", TopicSchema);
module.exports = Topics;