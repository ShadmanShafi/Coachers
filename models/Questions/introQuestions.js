const mongoose = require("mongoose");
const questionsSchema = new mongoose.Schema({
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

const questionBank_IntroQuestions = mongoose.model("introQuestions", questionsSchema);

module.exports = questionBank_IntroQuestions;
