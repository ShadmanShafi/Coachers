// Get questions from the database with the matching tag
const generateQuestionList = (tag) => {
    var questionList =[
        {
            Question: "What is 1",
            options: {
                a: 1,
                b: 2,
                c: 3,
                d: 4
            },
            correctAnswer: 'a'
        },
        {
            Question: "What is 3",
            options: {
                a: 1,
                b: 2,
                c: 3,
                d: 4
            },
            correctAnswer: 'c'
        },
    ]
    return questionList;
}

module.exports = generateQuestionList;
