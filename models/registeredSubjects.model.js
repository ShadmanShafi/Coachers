const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  subjects: [
      {type: String}
  ]
});

const User = mongoose.model("user_subjects", UserSchema);
module.exports = User;