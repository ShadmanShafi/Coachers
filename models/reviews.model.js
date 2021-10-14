const mongoose = require("mongoose");
const reviewsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  text: {
      type: String,
      required: true
  }
  
});

const Reviews= mongoose.model("reviews", reviewsSchema);


module.exports = {Reviews};