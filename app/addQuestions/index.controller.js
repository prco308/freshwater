var socket = io();
var questionsArray = [];

socket.on("generate tree", initTree);
socket.on("questionDeleted", questionDeleted);

function initQuestionTree(){
	socket.emit('getQuestions');
	
	$('#jstree').on("changed.jstree", function (e, data) {
		makeSelection(data);
	});
}

function deleteQuestion(){
	var questionToDelete = $("#parentID").val();
	if(questionToDelete == ""){
		alert("select a question to delete");
	}else{
		
		var txt;
		var r = confirm("Are you sure you want to delete this question?");
		if (r == true) {
			socket.emit("deleteQuestion", {id: questionToDelete});
		}
	}
	
}

function questionDeleted(data){
	if(data.success == false){
		alert("Please select a question with no sub-questions");
	}else if(data.success == true){
		alert("Question deleted");
	}
}

function makeSelection(data){
	console.log(data.selected[0]);
	$("#parentID").val(data.selected[0]);
}

function submitQuestion(){
	var parent = $("#parentID").val();
	var id = $("#key").val() + $("#qNumber").val();
	var text = $("#text").val();
	var answer = $("#answer").val();
	
	socket.emit("submitQuestion", {parent: parent, id: id, text: text, answer: answer});
	
	alert("question submitted");
	//init();
}

function initTree(data){
	for(var i = 0; i < data.array.length; i++){
		data.array[i].text = "(" + data.array[i].id + ") " + "(" + data.array[i].answer + ") " + data.array[i].text;
	}
	$('#jstree').jstree('destroy');
	$('#jstree').jstree({
		'core': {
			'check_callback' : true,
			'data': data.array
		}
	});
	$('#jstree').jstree('refresh');
	
}

function openAll(){
	var tree = $("#jstree");
    tree.bind("loaded.jstree", function (event, data) {
        tree.jstree("open_all");
    });
}

initQuestionTree();