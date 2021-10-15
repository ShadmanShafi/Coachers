const mongoose = require("mongoose");
const UserSubjectsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  subjects: []
});

const registeredSubjects = mongoose.model("user_subjects", UserSubjectsSchema);

const createSchedular = (weekMap) => {
  var list = [];
  weekMap.forEach((value,key)=>{
    list.push({
      week: key,
      topics: value
    });
  })
  return list;
}

const createSubjectInstanceForEnrolling = (subjectName, weekMap, deadline) => {
  
  const schedule = createSchedular(weekMap);
  return {
    name: subjectName,
    topicsCovered: [],
    schedule: schedule,
    deadline: deadline
  }
}

module.exports = {registeredSubjects, createSubjectInstanceForEnrolling};