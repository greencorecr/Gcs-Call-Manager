'use strict';

$('#dateFrom').datepick({dateFormat: 'yyyy-mm-dd'});
$('#dateUntil').datepick({dateFormat: 'yyyy-mm-dd'});

/*var calls = {statCalls:[
	{calls: [], length:'0', name:''},
	{calls: [], length:'0', name:''}
	]};*/
var calls = {users: []};

var queueViewModel = ko.viewmodel.fromModel(calls, {
	extend: {
		'{root}': function(root) {
			root.selectedStat =  ko.observable({
				calls: ko.observableArray(),
				length: '',
				name: ''
			});
			root.pauses =  ko.observable({
				show: false,
				pausesArray: ko.observableArray()
			});
		}
	}
});

/**
 * Connect to the socket.io server
 *
 **/
var socket = io.connect('/');

function agentReport() {
	var exten = $('#agentReport').val();	
	socket.emit('agentReport', exten);
}

agentReport();

socket.on('freshData', function(data){
	//alertify.log('freshData');
	calls.users = data;
	ko.viewmodel.updateFromModel(queueViewModel, calls);
});

function markSelectedStat(data, evt) {
	var stat = evt.currentTarget;
	var siblings = $(stat).siblings();
	$(siblings).removeClass('selectedAgent');
	clearAgentsChart();
	if (queueViewModel.selectedStat() !== data) {
		$(stat).addClass('selectedAgent');
		queueViewModel.selectedStat(data);
	} else {
		$(stat).removeClass('selectedAgent');
		clearSelectedStat();
	}	
}

function clearSelectedStat() {
	queueViewModel.selectedStat({
		calls: ko.observableArray(),
		length: '',
		name: ''
	});
	queueViewModel.selectedStat().calls.removeAll();
}

function agentsChart(data, evt) {
	var stat = evt.currentTarget;
	clearSelectedStat();
	var siblings = $(stat).siblings();
	$(siblings).removeClass('selectedAgent');
	if (queueViewModel.pauses() !== data.pauses) {
		$(stat).addClass('selectedAgent');
		queueViewModel.pauses(data.pauses);
		chartCanvas();
	} else {
		$(stat).removeClass('selectedAgent');
		clearAgentsChart();
	}	
}

function clearAgentsChart() {
	queueViewModel.pauses({
		show: false,
		pausesArray: ko.observableArray()
	});
	queueViewModel.pauses().pausesArray.removeAll();
}


/**
 * Returns an html string with the appropiate icon stack
 *
 * Recieves the state id and returns the icon stack for that state
 *
 **/
ko.bindingHandlers.statusIcon = {
	update: function(element, valueAccessor) {
		var iconMain ='';
		var iconCircle = 'icon-circle-blank';
		var status = valueAccessor();

		switch (status) {
			case '1':
				iconMain = 'icon-phone';
				break;
			case '2':
				iconMain = 'icon-comments-alt';
				break;
			case '3':
				iconMain = 'icon-minus-sign-alt';
				break;
			case '4':
				iconMain = 'icon-asterisk';
				break;
			case '5':
				iconMain = 'icon-phone';
				iconCircle = 'icon-ban-circle';
				break;
			case '6':
				iconMain = 'icon-bell';
				break;
			case '7':
				iconMain = 'icon-bell-alt';
				break;
			case '8':
				iconMain = 'icon-music';
				break;
			default:
				iconMain = 'icon-asterisk';
		}

		var iconStack = '<span class="icon-stack" title:"Status"><i class="'+iconMain+'"></i><i class="'+iconCircle+' icon-stack-base"></i></span>';
		$(element).html(iconStack);
	}
};


/**
 * Pause an Agent in the selected Queue
 *
 **/
/* exported pauseAgent */ //needed for JsHint
function pauseAgent(data) {
	var pkg = {
		id: data.id(),
		queue: data.queue(),
		interface: data.location(),
		paused: data.paused(),
		origin: 2
	};
	console.log(pkg.paused);
	if ('0' === pkg.paused) { //send a one to pause, zero to unPause
		pkg.paused = 1;
		alertify.log('Request to Pause '+data.name()+ ' in queue '+data.queue());
	} else {
		alertify.log('Request to Resume '+data.name()+ ' in queue '+data.queue());
		pkg.paused = 0;
	}
	socket.emit('pauseAgent', pkg);
}


/**
 * Remove an Agent from the selected Queue
 *
 **/
/* exported removeAgent */ //needed for JsHint
function removeAgent(data) {
	alertify.log('Request to remove '+data.name()+' '+data.id()+' from queue '+data.queue());
	var pkg = {
		id: data.id(),
		queue: data.queue(),
		interface: data.location(),
		origin: 2
	};
	socket.emit('removeAgent', pkg);
	clearAgentData(null, null);
}

function chartCanvas() {

	var column = { //dataSeries - first quarter
   		/*** Change type "column" to "bar", "area", "line" or "pie"***/        
		type: "column",
		name: "First Quarter",
		dataPoints: []
	};
	var totalSeg = 0;
	var p = queueViewModel.pauses().pausesArray();
	for (var i = 0; i < p.length; i++) {
		totalSeg += p[i].timeDiff();
	};
	column.dataPoints.push({label: queueViewModel.users()[0].id(), y: totalSeg});

	var data = [column];

	var chart = new CanvasJS.Chart("dashboard", {     
	  backgroundColor: 'rgba(75,183,119,0.1)',      
      title:{
        text: "Paused time"              
      },

      data: data
  });

    chart.render();
}

$('#range').click(function(){
	var from  = $('#dateFrom' ).datepick('getDate');
	var until = $('#dateUntil').datepick('getDate');

	var arrayId = queueViewModel.users()[0].id();
	socket.emit('filterPauses', {from: from[0], until: until[0], agents: arrayId, or: 1});
});

$('#AllPauses').click(function(){
	chartCanvas()
});

socket.on('singleAgentChart', function(pauses){
	var column = { //dataSeries - first quarter
   		/*** Change type "column" to "bar", "area", "line" or "pie"***/        
		type: "column",
		name: "First Quarter",
		dataPoints: []
	};
	var totalSeg = 0;
	for (var i = 0; i < pauses.length; i++) {
		totalSeg += pauses[i].timeDiff;
	};
	column.dataPoints.push({label: queueViewModel.users()[0].id(), y: totalSeg});

	var data = [column];

	var chart = new CanvasJS.Chart("dashboard", {     
	  backgroundColor: 'rgba(75,183,119,0.1)',      
      title:{
        text: "Paused time"              
      },

      data: data
  });

    chart.render();
});

socket.on('agentPaused', function(pkg){
	if(queueViewModel.pauses().show() == true){
		chartCanvas();
	}
});

ko.applyBindings(queueViewModel);
