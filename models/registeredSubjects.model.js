const mongoose = require("mongoose");
const UserSubjectsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  subjects: [
      {type: String}
  ]
});

const User = mongoose.model("user_subjects", UserSubjectsSchema);
module.exports = User;