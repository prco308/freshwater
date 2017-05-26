require('rootpath')();
var express = require('express');
var http  = require('http');
var app = express();
var port = process.env.PORT || 3000;
app.set('port', port);
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('questions');
var questionArray = [];
var collectionSize = 0;
var collection = db.questions;
var startID = "k1q1";

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));


// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/questions', require('./controllers/api/questions.controller'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

db.on('connected', function() {
    logger.info('Mongo DB connection open for DB');
});

/* app.get('/', function(req, res){
    res.sendfile('index.html', { root: __dirname + "/app/front" } );
}); */

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('getQuestions', getQuestions);
  socket.on('submitQuestion', submitQuestion);
  socket.on('initQuestion', initQuestion);
  socket.on('startOver', startOver);
  socket.on('getNextQuestion', function(data){
	  console.log("next question id: " + data.next);
	  startID = data.next;
	  getNextQuestion();
  });
  socket.on('deleteQuestion', function(data){
		var success = null;
		findParent(data.id, collection, function(result){
			var toBeRemoved = result[0];
			
			if(toBeRemoved.childIDs[0] == "" || toBeRemoved.childIDs[0] == null){
				success = true;
	
				//remove the selected question
				db.questions.remove({id: toBeRemoved.id});
				
				//remove its ID from its parent's childIDs
				db.questions.update(
					{ id: toBeRemoved.parent },
					{ $pull: { childIDs: { $in: [ toBeRemoved.id] }}} );
				
				io.emit("questionDeleted", {success: success});
				
			}else{
				success = false;
				io.emit("questionDeleted", {success: success});
				console.log("question NOT DELEETD");
			}
		});
	});
});

function startOver(socket){
	startID = "k1q1";
	console.log("START OVER");
	getNextQuestion();
	
}


function initQuestion(socket){
	getNextQuestion();
}

function getNextQuestion(){
	console.log("getnextuestion" + startID);
	var findID = startID;
	var childID1;
	var childID2;	
	var child1;
	var child2;
	
	findParent(findID, collection, function(result){
		currentQuestion = result[0];
		console.log("current question: " + result[0].id);
		childID1 = currentQuestion.childIDs[0];
		childID2 = currentQuestion.childIDs[1];
		
		findChildIDs(findID, collection, function(childResult){
			io.emit("displayQuestion", {parent: result, childIDs: childResult});
			console.log("next question SENT: " + result[0].id);
		});
	});
}

function findParent(findID, collection, callback){
	collection.find({id: findID}).toArray(function(err, result) {
        if (err) {
            console.log(err);
        } else if (result.length > 0) {
            callback(result);
        }
    });
}

function findChildIDs(findID, collection, callback){
	console.log("findChildIDS ENTER: " + findID);
	collection.find({parent: findID}).toArray(function(err, childResult) {
        if (err) {
            console.log(err);
        } else if (childResult.length >= 0) {
			console.log("findChildIDS: " + childResult);
            callback(childResult);
        }
    });
}
 


function getQuestions(socket){
	questionArray = [];
	db.questions.count(function(err, count) {
		collectionSize = count;
	});

	var counter = 0;
	db.questions.find().forEach(function(q){
		questionArray.push(q);
		counter++;
		if(counter == collectionSize){
			io.emit("generate tree", {array: questionArray});
			console.log("UPDATE REQUREST");
		}
	});	
};

function submitQuestion(data){
	var question = data;
	var childArray = [];
	db.questions.insert({id: question.id, answer: question.answer, text: question.text, parent: question.parent, childIDs: childArray});
	console.log("question submitted");
	
	//update parent by adding the new question to it as childID
	db.questions.update(
		{ id: question.parent },
		{ $push: { childIDs: question.id } } );
};


// start server
server.listen(port, function () {
    console.log('Server listening at http://' + port);
});