const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  topics: [ ]
  
});

const Subjects= mongoose.model("Subjects",subjectSchema);

const createTopic = (topicName, weekNumber, videoURL, description) => {
    return {
      topicName: topicName,
      weekNumber: weekNumber,
      videoURL: videoURL,
      description: description
    }
}


module.exports = {Subjects, createTopic};