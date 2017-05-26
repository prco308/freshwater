var config = require('config.json');
var express = require('express');
var router = express.Router();
var questionService = require('services/question.service');

// routes
router.post('/addQ', addQuestion);
router.get('/getQ', getQuestion);

module.exports = router;

function getQuestion() {
    questionService.getQuestion()
        .then(function (question) {
            if (question) {
                res.send(question);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function addQuestion(req, res) {
    questionService.addQuestion(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
