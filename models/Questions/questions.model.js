const mongoose = require("mongoose");
const questionBankSchema = new mongoose.Schema({
  subject: {
        type: String,
        required: true
  },
  topic: {
        type: String,
        required: true,
  },
  questions:[]
});

const QuestionBank = mongoose.model("questionBank", questionBankSchema);




const generateQuestion = (inputQuestion, optionA, optionB, optionC, optionD, correctOption, subjectName, topicName) => {
    return {
        question: inputQuestion,
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD,
        correctOption: correctOption,
        subject: subjectName,
        topic: topicName
    }
}

const checkQuestionsAnswer = (inputQuestion, answeSelected)=>{
    if(answerSeclected == inputQuestion.correctOption)
        return true;
    else
        return false;
}

module.exports = {generateQuestion, QuestionBank, checkQuestionsAnswer};
