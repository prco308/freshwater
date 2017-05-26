var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    res.render('addQuestion');		//run the ejs file
});

router.post('/', function (req, res) {
    // register using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/questions/addQ',		//link to user.controller in api folder
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.render('login', { error: 'An error occurred' });
        }

        if (response.statusCode !== 200) {
            return res.render('login', {
                error: response.body,
                questionID: req.body.questionID,
                description: req.body.description,
                option1: req.body.option1,
                option2: req.body.option2,
				        parentID: req.body.parentID,
                childID1: req.body.childID1,
				        childID2: req.body.childID2
            });
        }

        // return to login page with success message
        req.session.success = 'Question Added';
        return res.redirect('/login');
    });
});

module.exports = router;
