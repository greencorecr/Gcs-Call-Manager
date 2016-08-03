'use strict';

$('#dateFrom').datepick({dateFormat: 'yyyy-mm-dd'});
$('#dateUntil').datepick({dateFormat: 'yyyy-mm-dd'});

/*var queueArray = {queues:[
	{id: 'default2', completed:'0', abandoned:'0', holdtime:'0', waiting_calls:'0', agents:[
		{id:'0',name: 'fede', location:'', status: 1, paused: 0, statusName:'', caller:'', lastCall:'', taken:'', queue:'default2'},
		{id:'1',name: 'Conde de Romanones Calientes', location:'', status: 1, paused: 1, statusName:'', caller:'', lastCall:'', taken:'', queue:'default2'}]
		,age:'0'},
	{id: 'default3', completed:'0', abandoned:'0', holdtime:'0', waiting_calls:'0', agents:[
		{id:'0',name: 'fede', location:'', status: 1, paused: 1, statusName:'', caller:'', lastCall:'', taken:'', queue:'default3'}]
		,age:'0'}
	]};*/
var queueArray = {queues:[]};

var queueViewModel = ko.viewmodel.fromModel(queueArray, {
	arrayChildId: {
		'{root}.queues':'id',
		'{root}.queues[i].agents': 'id'
	},
	extend: {
		'{root}': function(root) {
			root.selectedQueue = ko.observable({
				id: '',
				completed: '',
				abandoned: '',
				holdtime: '',
				waiting_calls: '',
				statsCalls: ko.observableArray(),
				agents: ko.observableArray(),
				agentsCharts: false
			});
			root.selectedStat =  ko.observable({
				calls: ko.observableArray(),
				length: '',
				name: ''
			});
			root.agentsCharts =  ko.observable({
				agentsCharts: false,
				agents: ko.observableArray()
			});
			root.pausesArray =  ko.observableArray();
			root.pausedAgent =  ko.observable({
				_id: '',
				totalSeg: 0,
				pauses: ko.observableArray()
			});
		}
	}
});

/**
 * Connect to the socket.io server
 *
 **/
var socket = io.connect('/');


socket.emit('queueReport');

socket.on('queueReport', function(data){
	//alertify.log('queueReport');
	queueArray.queues = data;
	ko.viewmodel.updateFromModel(queueViewModel, queueArray);
});

function markSelectedQueue(data, evt) {
	var parent = $(evt.currentTarget).parent();
	clearSelectedStat();
	clearAgentsChart();
	if (queueViewModel.selectedQueue() !== data) {
		var siblings = $(parent).siblings();
		$(siblings).removeClass('active');
		$(parent).addClass('active');
		queueViewModel.selectedQueue(data);
	} else {
		$(parent).removeClass('active');
		clearSelectedQueue();
	}	
}

function clearSelectedQueue() {
	queueViewModel.selectedQueue({
		id: '',
		completed: '',
		abandoned: '',
		holdtime: '',
		waiting_calls: '',
		statsCalls: ko.observableArray(),
		agents: ko.observableArray(),
		agentsCharts:false
	});
}


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
	if (queueViewModel.agentsCharts().agents !== queueViewModel.selectedQueue().agents) {
		$(stat).addClass('selectedAgent');
		queueViewModel.agentsCharts({agents: queueViewModel.selectedQueue().agents, agentsCharts: queueViewModel.selectedQueue().agentsCharts});
		agentsCharts(queueViewModel.selectedQueue().agents());
	} else {
		$(stat).removeClass('selectedAgent');
		clearAgentsChart();
	}	
}

function clearAgentsChart() {
	queueViewModel.agentsCharts({
		agentsCharts: false,
		agents: ko.observableArray()
	});
	queueViewModel.agentsCharts().agents.removeAll();
	clearPausedAgent();
}

function clearPausedAgent() {
	queueViewModel.pausedAgent({
		_id: '',
		totalSeg: 0,
		pauses: ko.observableArray()
	});
	queueViewModel.pausedAgent().pauses.removeAll();
}

function agentsCharts(agents) {
	var arrayId = []
	for (var i = 0; i < agents.length; i++) {
		arrayId.push({'agent': agents[i].id()});
	};
	socket.emit('agentsCharts', arrayId)
}

socket.on('agentsCharts', function(agents){
	queueViewModel.pausesArray(agents);
	var column = { //dataSeries - first quarter
		click: function(e){
        	var notFind = true;
        	var i = 0;
        	while(notFind){
        		var paused = queueViewModel.pausesArray()[i];
        		if(paused._id == e.dataPoint.label){
        			notFind = false;        			
        			queueViewModel.pausedAgent(paused);
        		}
        		i++;
        	}
        },
   		/*** Change type "column" to "bar", "area", "line" or "pie"***/        
		type: "column",
		name: "First Quarter",
		dataPoints: []
	};
	for (var i = 0; i < agents.length; i++) {
		column.dataPoints.push({label: agents[i]._id, y: agents[i].totalSeg});
	};
	var data = [column];

	chartCanvas(data);
	// dashboard('#dashboard',freqData);

	var stats = {};
    for (var a in agents){
    	for (var p in agents[a].pauses)
        	stats[agents[a].pauses[p].epochFinish] = 1;
    }
});


function chartCanvas(data) {
	var chart = new CanvasJS.Chart("dashboard", {     
	  backgroundColor: 'rgba(75,183,119,0.1)',      
      title:{
        text: "Paused time per Agent"              
      },

      data: data
  });

    chart.render();
}

$('#range').click(function(){
	var from  = $('#dateFrom' ).datepick('getDate');
	var until = $('#dateUntil').datepick('getDate');

	var agents = queueViewModel.selectedQueue().agents();
	var arrayId = []
	for (var i = 0; i < agents.length; i++) {
		arrayId.push({'agent': agents[i].id()});
	};
	socket.emit('filterPauses', {from: from[0], until: until[0], agents: arrayId, or: 0});
});

$('#AllPauses').click(function(){
	agentsCharts(queueViewModel.selectedQueue().agents());
});

ko.applyBindings(queueViewModel);
