var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('questions');

var service = {};

service.addQuestion = addQuestion;
service.getQuestion = getQuestion;

module.exports = service;

function getQuestion(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function addQuestion(questionParam) {
    var deferred = Q.defer();

    // validation
    db.questions.findOne(
        { questionID: questionParam.questionID },
        function (err, question) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (question) {
                // username already exists
                deferred.reject('Question ID "' + questionParam.questionID + '" is already taken');
            } else {
                createQuestion();
            }
        });

    function createQuestion() {
        // set user object to userParam without the cleartext password
        var question = _.omit(questionParam, 'childID1', 'childID2');

        // add hashed password to user object
        //question.hash = bcrypt.hashSync(questionParam.childID, 10);
		question.childID = [questionParam.childID1, questionParam.childID2];

        db.questions.insert(
            question,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
