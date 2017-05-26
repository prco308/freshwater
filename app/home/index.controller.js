var socket = io();
var questionsArray = [];
var currentQuestion, child1, child2;
var answerSelected;

socket.on("displayQuestion", displayQuestion);

function init(){
	socket.emit('initQuestion');
	
	//$("label[for='textField']").hide();
	
	$('#questionForm input').on('change', function() {
		answerSelected = $('input[name=answer]:checked', '#questionForm').val();
		console.log("select rdo button" + answerSelected);
	});
	
	if( $('#questionForm').length )         // use this if you are using id to check
{
     console.log("question form EXISTS");
}else{
	console.log("question form DOES NOT EXIST");
}
	
	//$("#start").hide();
	//$("#startOver").show();
}

function restart(){
	console.log("sratr over!!!");
	socket.emit('startOver');
}

function testing(){
	init();
	$("#test").hide();
}

function nextQuestion(){
	console.log("next question " + answerSelected);
	$('input[name=answer]').attr('checked',false);
	
	var nextQuestion = null;
	
	if(answerSelected == "option1"){
		socket.emit('getNextQuestion', {next: child1.id});
		answerSelected = null;
	}else if(answerSelected == "option2"){
		socket.emit('getNextQuestion', {next: child2.id});
		answerSelected = null;
	}
	//$("input:answer").removeAttr("checked");
}

function displayQuestion(data){
	//$("label[for='textField']").show();
	
	console.log("display: " + data.parent[0].id);
	
	currentQuestion = data.parent[0];
	child1 = data.childIDs[0];
	child2 = data.childIDs[1];
	

	$("label[for='textField']").html(currentQuestion.text);
	$("label[for='rdo1']").html(child1.answer);
	$("label[for='rdo2']").html(child2.answer);

}

$( document ).ready(function() {
	init();
});
(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService) {
        var vm = this;

        vm.user = null;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
    }

})();
