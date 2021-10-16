const mongoose = require("mongoose");
const accuracySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  accuracies: []
});

const accuracyRecommendSchema = mongoose.model("userRecommendAccuracies", accuracySchema);
module.exports = accuracyRecommendSchema;