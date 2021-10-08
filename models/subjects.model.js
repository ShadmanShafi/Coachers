const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  topics: [
    {type: mongoose.Types.ObjectId, ref: 'topic',}
  ]
  
});

const Subjects= mongoose.model("Subjects",subjectSchema);
module.exports = Subjects;