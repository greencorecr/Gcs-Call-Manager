/** 	     Greencore Solutions SRL
 * Client side script for Greencore's Queue Manager
 *
 * Uses knockout.js, knockout viewmodel plugin, alertify
 *
 **/
/*global $:false */
/*global ko:false */
/*global alertify:false */
/*global io:fasle */
/*global unescape:false */


'use strict';


var user = {}; //Global user preferences


/**
 * Animates transitions
 *
 **/
ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        /*jshint expr:true */
        shouldDisplay ? $(element).fadeIn('slow') : $(element).hide();
    },
    update: function(element, valueAccessor) {
        var shouldDisplay = valueAccessor();
        /*jshint expr:true */
        shouldDisplay ? $(element).fadeIn('slow') : $(element).fadeOut();
    }
};

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
 * If status changes to a non talking state, cancel Spy attempt
 *
 **/
ko.bindingHandlers.checkStatusForSpy = {
	update: function(element, valueAccessor) {
		if (!isTalking(valueAccessor()) && $(element).is(':visible')) {
			$(element).fadeOut('200');
			alertify.log('The Call has ended, monitor canceled');
		}
	}
};

ko.bindingHandlers.updateViewPrefs = {
	init: function(element, valueAccessor) {
		if ((user[valueAccessor()]) && ('minimized' === user[valueAccessor()])) {
			var evtMock = {};
			evtMock.currentTarget = element;
			var dataMock = {};
			dataMock.id = function() {return valueAccessor();};
			dataMock.fromViewPrefs = true;

			hideQueue(dataMock, evtMock);
		}
	}
};

/**
 * Cookie getter by name, helper function
 *
 **/
function getCookie(cookiename) {
  // Get name followed by anything except a semicolon
  var cookiestring = new RegExp(''+cookiename+'[^;]+').exec(document.cookie);
  // Return everything after the equal sign
  return unescape(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,'') : '');
}

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

/**
 * Connect to the socket.io server
 *
 **/
var socket = io.connect('/');

	socket.emit('login');

/**
 * Create and expand the KnockOut viewmodel
 *
 * The selectedAgent expansion is for the infoWindow, and the agent.selected expansion is for adding or removing
 * selected class to the View
 *
 * viewPreferences is to be extracted from the server
 *
 **/
var AppViewModel = ko.viewmodel.fromModel(queueArray, {
	arrayChildId: {
		'{root}.queues':'id',
		'{root}.queues[i].agents': 'id'
	},
	extend: {
		'{root}': function(root) {
			root.selectedAgent = ko.observable({
				name: 'Select an agent', 
				queue:false,
				location:'',
				stInterface:'',
				membership:'',
				lastCall:'',
				status:ko.observable(), //needs to be observable from the start
				statusName:'',
				paused:ko.observable(),
				taken:'',
				penalty:'',
				caller:'',
				id:'',
				age:''
			});

			root.selectedQueue = ko.observable({
				abandonedDay:'',
				id: '',
				statsCalls: ko.observableArray()
			});
		},
		'{root}.queues[i].agents[i]': function(agent) {
			agent.selected = ko.observable(false);
		}
	}
});


/**
 * Hide Queue div
 *
 **/
function hideQueue(data, evt) {
	$(evt.currentTarget).parentsUntil('queueHead').toggleClass('minimized');
	$(evt.currentTarget).siblings().toggle('slow');
	$(evt.currentTarget).parent().siblings().slideToggle('slow');

	if (!data.fromViewPrefs) {
		var pkg = {
			userId: user.userId,
			queueId: data.id(),
			view: ''
		};

		if ('minimized' === user[data.id()]) {
			pkg.view = 'normal';
		} else {
			pkg.view = 'minimized';
		}

		socket.emit('userPrefs', pkg);
	}
}
/**
 * When client is mobile instead of the info Window we use a dropdown that we show with this function
 *
 **/
function showDropUl(data, evt) {
	var agentTop = evt.currentTarget;
	var ul = $(agentTop).siblings();		
	if (ul.is(':visible')) {
		ul.slideUp('slow');
		$('.agentTop').removeClass('selectedAgent');
	} else {
		/* jshint validthis: true */
		$('.agentDrop').not(this).slideUp('slow');
		$('.agentTop').not(agentTop).removeClass('selectedAgent');
		$(agentTop).addClass('selectedAgent');
		ul.slideDown('slow');
	}
}

function showQueueDropUl(data, evt) {
	var statsData = evt.currentTarget;
	var queueDrop = $(statsData).children().last();		
	if (queueDrop.is(':visible')) {
		queueDrop.slideUp('slow');
		$('.statsData').removeClass('selectedAgent');
	} else {
		/* jshint validthis: true */
		$('.queueDrop').not(this).slideUp('slow');
		$('.statsData').not(statsData).removeClass('selectedAgent');
		$(statsData).addClass('selectedAgent');
		queueDrop.slideDown('slow');
	}
}

/**
 * Check if agent is in any mode that allows chanSpy
 *
 **/
function isTalking(data) {
	switch (data) {
		case '2':
		case '7':
		case '8':
			return true;
		default:
			return false;
	}
}

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
		origin: 0
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
		id: '',
		queue: data.queue(),
		interface: data.location(),
		origin: 0
	};
	socket.emit('removeAgent', pkg);
	clearAgentData(null, null);
}

/**
 * Originate a ChanSpy channel to monitor the selected agent
 *
 * The agent must be in a state that allows it and needs an 
 * extension number to send the monitoring channel
 *
 **/
/* exported spyAgent */ //needed for JsHint
function spyAgent(form) {
	console.log('Inputted extension: '+form.supExtension.value);
	console.log('create chanspy with: '+AppViewModel.selectedAgent().location()+' and Local/'+form.supExtension.value);
	var pkg = {
		agentId: AppViewModel.selectedAgent().stInterface(),
		supervisorId: form.supExtension.value
	};
	$('#spyForm').toggle('slow');
	if (isTalking(AppViewModel.selectedAgent().status())) {
		socket.emit('spyAgent', pkg);
	} else {
		alertify.log('Agent Monitor Canceled, '+AppViewModel.selectedAgent().name+' call ended');
	}
}

/**
 * Toggle visibility on ChanSpy Form 
 *
 **/
/* exported toggleSpyForm */ //needed for JsHint
function toggleSpyForm(data, evt) {
	/* jshint unused:false */
	$('#spyForm').toggle('slow');
}

/**
 * Apply special style to selected agent and clear all other agentTops
 * 
 * -- If the clicked agent is currently selected, then unselect all
 *
 **/
/* exported markSelectedAgent */ //needed for JsHint
function markSelectedAgent(data, evt) {
	if ($('.infoContainer').is(':visible')) {
		if (AppViewModel.selectedAgent() !== data) {
			clearQueueData();
			var clickedElement = $(evt.currentTarget);
			$('.agentTop').not(clickedElement).removeClass('selectedAgent');
			$('.statsData').not(clickedElement).removeClass('selectedAgent');
			$(clickedElement).addClass('selectedAgent');
			AppViewModel.selectedAgent(data);
		} else {
			clearAgentData();
			clearQueueData();
		}
	} else {
		showDropUl(data, evt);
	}
}

/**
 * Fade Out the selected agent and then reset the selectedAgent observable
 *
 **/
function clearAgentData(data, evt) {
	/* jshint unused:false */
	$('#infoAgentData').fadeOut('400', function(){
		AppViewModel.selectedAgent({
			name: 'Select an agent',
			queue: false,
			location:'',
			stInterface:'',
			membership:'',
			lastCall:'',
			status:ko.observable(), //needs to be observable from the start
			statusName:'',
			paused:ko.observable(),
			taken:'',
			penalty:'',
			caller:'',
			id:'',
			age:''
		});
	});
	$('.agentTop').removeClass('selectedAgent');
}


function detailedQueue(data, evt) {
	if ($('.infoContainer').is(':visible')) {
		if (AppViewModel.selectedQueue() !== data) {
			clearAgentData();
			var clickedElement = $(evt.currentTarget);
			$('.statsData').not(clickedElement).removeClass('selectedAgent');
			$('.agentTop').not(clickedElement).removeClass('selectedAgent');
			$(clickedElement).addClass('selectedAgent');
			AppViewModel.selectedQueue(data);
		} else {
			clearQueueData();
			clearAgentData();
		}
	} else {
		showQueueDropUl(data, evt);
	}
}


function clearQueueData(data, evt) {
	/* jshint unused:false */
	$('#infoQueueData').fadeOut('400', function(){
		AppViewModel.selectedQueue({
			abandonedDay:'',
			id: '',
			statsCalls: ko.observableArray()
		});
	});
	$('.statsData').removeClass('selectedAgent');
}


socket.on('generalMsg', function(msg){
	alertify.log(msg.msg);
});

socket.on('freshData', function(data){
	//alertify.log('freshData');
	queueArray.queues = data;
	ko.viewmodel.updateFromModel(AppViewModel, queueArray);
});

socket.on('agentRemoved', function(data){
	alertify.log('Agent '+data.name+' removed from queue '+data.queue);
	if ((AppViewModel.selectedAgent().id() === data.id) && (AppViewModel.selectedAgent().queue() === data.queue)) {
		clearAgentData(null, null);
	}
});

socket.on('newAgent', function(data) {
	alertify.log('Agent '+data.name+' added to queue '+data.queue);
});


$(document).ready(function() {
	var userPrefs = JSON.parse(getCookie('user'));
	userPrefs.name = decodeURI(userPrefs.name);
	
	user.userId = userPrefs.id;
	user.userName = userPrefs.name;
	userPrefs.queues.forEach(function(queue, index) {
		/* jshint unused:false */
		user[queue.queueId] = queue.view;
	});

	ko.applyBindings(AppViewModel);
});
