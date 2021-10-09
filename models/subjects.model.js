const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  topics: [
    {type: Array}
  ]
  
});

const Subjects= mongoose.model("Subjects",subjectSchema);
module.exports = Subjects;