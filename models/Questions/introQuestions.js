const mongoose = require("mongoose");
const questionBankSchema = new mongoose.Schema({
    question: {
        type: String, 
        required: true
    },

    A: {
        type: String, 
        required: true
    },

    B:{
        type: String, 
        required: true
    },

    C: {
        type: String, 
        required: true
    },

    D: {
        type: String, 
        required: true
    },

    correctOption: {
        type: String, 
        required: true
    },

    subject: {
        type: String, 
        required: true
    },

});

const questionBank_IntroQuestions = mongoose.model("questionBank_IntroQuestions", questionBankSchema);

module.exports = {questionBank_IntroQuestions};
