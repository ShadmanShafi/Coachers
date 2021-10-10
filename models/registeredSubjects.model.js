const mongoose = require("mongoose");
const UserSubjectsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  subjects: []
});

const registeredSubjects = mongoose.model("user_subjects", UserSubjectsSchema);


const createSubjectInstanceForEnrolling = (subjectName) => {
  return {
    subjectName: subjectName,
    topicsCovered: []
  }
}

module.exports = {registeredSubjects, createSubjectInstanceForEnrolling};