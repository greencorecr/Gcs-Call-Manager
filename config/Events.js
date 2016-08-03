'use strict';

var Event = require('../models/Event'),
	queue = require('../models/queue'),
	moment = require('moment'),
	User = require('../models/user'),
	pause = require('../models/pause');

exports.add = function (eventAMI) {
	// console.log(eventAMI)
	var epochTime = moment().unix();
	var momentDate = moment().format('MMM Do YYYY, h:mm:ss a');

	var ev = new Event({
		events: [{
	        status: eventAMI.channelstatedesc,
			epoch: epochTime,
			exten: eventAMI.exten,
			name: eventAMI.event
	     }],
		date: momentDate,
		status: "Abandoned",
		channel: eventAMI.channel,
		uniqueid: eventAMI.uniqueid,
		calleridnum: eventAMI.calleridnum,
		calleridname: eventAMI.calleridname,
		connectedlinenum: eventAMI.connectedlinenum,
		connectedlinename: eventAMI.connectedlinename
	});
	if(!eventAMI.hasOwnProperty("connectedlinenum") ){
		ev.connectedlinenum = '';
		ev.connectedlinename = '';
	}
	if(!eventAMI.hasOwnProperty("calleridnum") ){
		ev.calleridnum = '';
		ev.calleridname = '';
	}
	// console.log(ev)
	ev.save(function(error, evnt) {
		if (error) console.log(error);
		else{
			// console.log(evnt)
			if (eventAMI.event == 'Hangup') {
				mergeEventsSingle(evnt.uniqueid);
			}
		}
	});
}


exports.freshData = function (data, cb) {
	var queueArray = data.queueArray;
	// console.log("*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+")
	// console.log(queueArray)
	// console.log(extenUser)
	if(data.order === 0) { //admin Page
		queue.find().exec( function (err, queues){
	 		// console.log(queues);
			abandonedCalls(queueArray, function(queueArray){
				var j = queues[0].queues.length - 1;
				for (var i = 1; i < queueArray.length; i++) {
					// console.log(queues[0].queues[j]);
					queueArray[i].abandoned = queues[0].queues[j--].abandoned;
				};//for i
				// console.log("antes de enviar a app");
	 			return cb(queueArray);
	 		});
		})//queue
	} else { //agents report
 		for (var i = 0; i < queueArray.length; i++) {
			for (var j = 0; j < queueArray[i].agents.length; j++) {
				if(queueArray[i].agents[j].id === data.extenUser){
						agentReport(queueArray[i].agents[j], function(users){
						return cb(users);
					});
				}
			};
		};
	}
}


exports.abandoned = function(cb){
	queue.find({}, function (err, queues) {
		var colas = queues[0];
		// console.log(colas)
		Event.find({channel: {'$regex': /SIP/}, '$and': [{'events.status': {'$ne': 'Up'}}, {'events.status': 'Ringing'}, {'events.name': 'Hangup'}, {'events.epoch': {'$gte' : colas.epoch}}]}).exec( function (err, ami_datos){
			for (var i = 0; i < ami_datos.length; i++) {
				// console.log(ami_datos[i]);
				var splitConnectedName = ami_datos[i].connectedlinename.split('-');
				if(splitConnectedName.length > 1){
				/*
					splitConnectedName[0] == 'RE' ? colas.queues[0].abandoned = parseInt(colas.queues[0].abandoned) + 1 : // 0 :
					splitConnectedName[0] == 'ST' ? colas.queues[1].abandoned = parseInt(colas.queues[1].abandoned) + 1 : // 0 :
					splitConnectedName[0] == 'VE' ? colas.queues[2].abandoned = parseInt(colas.queues[2].abandoned) + 1 : // 0 :
					splitConnectedName[0] == 'CU' ? colas.queues[3].abandoned = parseInt(colas.queues[3].abandoned) + 1 : // 0 :
					splitConnectedName[0] == 'CO' ? colas.queues[4].abandoned = parseInt(colas.queues[4].abandoned) + 1 : // 0 :
				   					colas.queues[5].abandoned = parseInt(colas.queues[5].abandoned) + 1 ; // 0 ;
				*/
					// console.log(ami_datos[i]);
					var h = 0, noEnd = true;
        	                        while(h < queues.queues.length && noEnd) {
 	                                       if(splitCallerIdName[0] == queues.queues[h].code){
                                	             	colas.queues[h].abandoned = parseInt(colas.queues[h].abandoned) + 1;
                        	                        noEnd = false;
                	                        }
        	                                h++;
	                                }

				}
				if(i == ami_datos.length - 1){
					var j = 0;
					while('Hangup' !== ami_datos[i].events[j].name){ /*console.log(ami_datos[i].events[j]);*/ j++;}
					// console.log(ami_datos[i])
					colas.epoch = parseInt(ami_datos[i].events[j].epoch) + 1;
				}
			}

			colas.save(function (err, cola){
				if(err) console.log(err);
				console.log(colas);
				return cb();

			});
		});
	});
}

function abandonedCalls (queueArray, cb){
	// console.log(queueArray);
	var epochGte = moment();
	epochGte.hours(0);
	epochGte.minutes(0);
	epochGte.seconds(0);

	Event.find({channel: {'$regex': /SIP/}, '$and': [{'events.status': {'$ne': 'Up'}}, {'events.status': 'Ringing'}, {'events.name': 'Hangup'}, {'events.epoch': {'$gte': epochGte.unix() }}]}).exec( function (err, ami_datos){
	   queue.findOne().exec( function (err, queues) {
		if(err) return cb(queueArray);
		var tamQueue = queueArray.length - 1;
		var abandonedCalls = [];//new Array(tamQueue);
		for (var i = 0; i < tamQueue; i++){
			abandonedCalls[i] = new Array();
		} console.log(ami_datos.length)
		 console.log(abandonedCalls);
		for (var i = 0; i < ami_datos.length; i++) {

			var splitCallerIdName = ami_datos[i].calleridname.split('-');
			if(splitCallerIdName.length > 1){
			
				splitCallerIdName[0] == 'RE' ? abandonedCalls[0].push( ami_datos[i] ) : // 0 :
				splitCallerIdName[0] == 'ST' ? abandonedCalls[1].push( ami_datos[i] ) : // 0 :
				splitCallerIdName[0] == 'VE' ? abandonedCalls[2].push( ami_datos[i] ) : // 0 :
				splitCallerIdName[0] == 'CU' ? abandonedCalls[3].push( ami_datos[i] ) : // 0 :
							       abandonedCalls[4].push( ami_datos[i] ) ; // 0 :
			/*
				var h = 0, end = false;
				while(h < queues.queues.length && !end) {
					if(splitCallerIdName[0] == queues.queues[h].code){
						abandonedCalls[h].push( ami_datos[i] );
						end = true;
					}
					h++;
				}		
		*/	}
			// console.log("abandonedCalls function ----------------------------------------------------");
				
		}
		
		for (var j = 1, k = queueArray.length - 2; j < queueArray.length; j++, k--) {
			queueArray[j].statsCalls   = abandonedCalls[k];
			(ami_datos.length != 0)? queueArray[j].abandonedDay = abandonedCalls[k].length : queueArray[j].abandonedDay = 0;
		};
		return cb(queueArray);
	  });//queue
	});//eventos
}

exports.queueReport = function (queueArray, cb){

	Event.find({channel: {'$regex': /SIP/},queue: {'$nin':[""]}, '$and': [{'events.status': {'$ne': 'Up'}}, {'events.status': 'Ringing'}, {'events.name': 'Hangup'}]}).sort({"_id": -1}).exec( function (err, abandoned){
		Event.find({channel: {'$regex': /SIP/},queue: {'$nin':[""]}, '$and': [{'events.status': 'Up'}, {'events.name': 'Hangup'}]}).sort({'events.epoch': -1}).exec( function (err, completed){


		   queue.findOne().exec( function (err, queues) {
			if(err) return cb(queueArray);
			var tamQueue = queueArray.length - 1;
			var abandonedCalls = [];//new Array(tamQueue);
			var completedCalls = [];//new Array(tamQueue);
			for (var i = 0; i < tamQueue; i++) {
				abandonedCalls[i] = new Array();
				completedCalls[i] = new Array();
			}
			
			for (var i = 0; i < abandoned.length; i++) {
				
				var splitCallerIdName = abandoned[i].calleridname.split('-');
				if(splitCallerIdName.length > 1){
					
					splitCallerIdName[0] == 'RE' ? abandonedCalls[0].push( abandoned[i] ) : // 0 :
					splitCallerIdName[0] == 'ST' ? abandonedCalls[1].push( abandoned[i] ) : // 0 :
					splitCallerIdName[0] == 'VE' ? abandonedCalls[2].push( abandoned[i] ) : // 0 :
					splitCallerIdName[0] == 'CU' ? abandonedCalls[3].push( abandoned[i] ) : // 0 :
								       abandonedCalls[4].push( abandoned[i] ) ; // 0 :
								   
				/*
                               		var h = 0, noEnd = true;
					while(h < queues.queues.length && noEnd) { 
                        	                if(splitCallerIdName[0] == queues.queues[h].code){ 
                	                                abandonedCalls[h].push( abandoned[i] );
        	                                        Event.findByIdAndUpdate(abandoned[i]._id,{queue:queues.queues[h].name}, function (err, queue){});
							noEnd = false;
    	                                    } else if(h==queues.queues.length -1) {
                              			 Event.findByIdAndUpdate(abandoned[i]._id,{queue:""}, function (err, queue){}); 
                           		    }
                                        	h++;
                                	}
			*/	}
				// console.log("abandonedCalls function ----------------------------------------------------");	
			}

			
			for (var i = 0; i < completed.length; i++) {
				
				var splitCallerIdName = completed[i].calleridname.split('-');
				if(splitCallerIdName.length > 1){
				
					splitCallerIdName[0] == 'RE' ? completedCalls[0].push( completed[i] ) : // 0 :
					splitCallerIdName[0] == 'ST' ? completedCalls[1].push( completed[i] ) : // 0 :
					splitCallerIdName[0] == 'VE' ? completedCalls[2].push( completed[i] ) : // 0 :
					splitCallerIdName[0] == 'CU' ? completedCalls[3].push( completed[i] ) : // 0 :
								       completedCalls[4].push( completed[i] ) ;
				/*
	                                var h = 0, noEnd = true;
					while(h < queues.queues.length && noEnd) {
						if(splitCallerIdName[0] == queues.queues[h].code){
     							completedCalls[h].push( completed[i] );
							Event.findByIdAndUpdate(completed[i]._id,{queue:queues.queues[h].name}, function (err, queue){});
                         				noEnd = false;
                                        	 } else if(h==queues.queues.length -1) {
                                                 Event.findByIdAndUpdate(completed[i]._id,{queue:""}, function (err, queue){}); 

                                            }
                           			 h++;
                                	 }
			*/	}
				// console.log("abandonedCalls function ----------------------------------------------------");	
			}

			for (var j = 1, k = queueArray.length - 2; j < queueArray.length; j++, k--) {
				queueArray[j].statsCalls.push({calls: completedCalls[k], name: "Completed: ", length: completedCalls[k].length});
				queueArray[j].statsCalls.push({calls: abandonedCalls[k], name: "Abandoned: ", length: abandonedCalls[k].length});
				queueArray[j].abandonedDay = abandonedCalls[k].length;
			};
			// console.log(queueArray);
			return cb(queueArray);
		  });//queues 
		});//eventos
	});//eventos
}

function agentReport (agent, cb){
	// console.log(agent);

	Event.find({channel: {'$regex': /SIP/}, 'connectedlinenum': agent.id, 'events.status': 'Ringing'}).sort({"_id":-1}).exec( function (err, received){
		Event.find({channel: {'$regex': /SIP/}, 'calleridnum': agent.id, 'events.status': 'Ring', '$and' : [{'events.exten': { '$not': /\*45/ }}, {'events.exten': { '$not': /555/ }}]}).sort({"_id":-1}).exec( function (err, realized){
			pause.find({agent: agent.id}).exec( function (err, pausesArray){

				if(!err){
					var statsCalls = [],
						pauses = [];
					statsCalls.push({calls: received, name: "Received: ", length: received.length});
					statsCalls.push({calls: realized, name: "Realized: ", length: realized.length});
					pauses = {pausesArray: pausesArray, show: true};
					agent.statsCalls = statsCalls;
					agent.pauses = pauses;
					// console.log(agent)
				}
				var users = [agent];
				return cb(users);
			});//pauses
		});//realized
	});//received
}

exports.pausedAgent = function (data, cb){
	var epoch = moment();
	var pausedAgent = {}
	if(data.payload.paused == 1){
		pausedAgent = new pause({
			agent: data.extenUser,
			epochStart: epoch.unix(),
			epochS: epoch.format('MMM Do YYYY, h:mm:ss a'),
			state: data.payload.paused
		});
		pausedAgent.save(function(){
			return cb();
		});
	} else {
		pause.find({agent: data.extenUser}).sort({_id: -1}).limit(1).exec( function (err, pAgent){
			var diff = epoch.unix() - pAgent[0].epochStart;
			var h, m, s;
			if(diff < 60){ // si la pausa no duro ni un minuto
				h = m = 0;
				s = diff;
			} else { 
				h = Math.floor(diff / 60 / 60);
				diff -= h*60*60;
				m = Math.floor(diff / 60);
				diff -= m*60;
				s = diff;
			}
			m < 10 ? m = ":0" + m : m = ":" + m ;
            s < 10 ? s = ":0" + s : s = ":" + s ;
            console.log(h + m + s)
			pausedAgent = {
				epochFinish: epoch.unix(),
				epochF: epoch.format('MMM Do YYYY, h:mm:ss a'),
				timeDiff: diff,
				timeD: h + m + s
			}
			pause.findByIdAndUpdate(pAgent[0]._id, pausedAgent, function (err, pAgent){
				return cb();
			});
		});
	}
}

exports.agentsCharts = function (match, cb) {
	var pipeline = [
        { "$match" : match
        },
        { '$group': {
	        	'_id': '$agent', 
	        	'totalSeg': {
	        		'$sum':'$timeDiff'
	        	},
	        	'pauses' : { 
	        		'$push' : { 
	        			'epochFinish' : '$epochFinish', 
	        			'epochStart': '$epochStart', 
	        			'timeDiff': '$timeDiff',
	        			'epochF' : '$epochF', 
	        			'epochS': '$epochS', 
	        			'timeD': '$timeD'
	        		}
        		} 
        	}
        }
    ];
	pause.aggregate(pipeline, function (err, pauses) {
		console.log(pauses)
		return cb(pauses);
	});
}
exports.singleAgentChart = function (search, cb) {

	pause.find(search, function (err, pauses) {
		if(err) return cb(new Array());
		console.log(pauses)
		return cb(pauses);
	});
}

function mergeEventsSingle (uniqueid){
	Event.find({uniqueid: uniqueid}).exec(function(err,evnts){
	   queue.findOne().exec( function (err, colas) {
		// console.log(evnts)
		var delField = [ ]; 
		if(evnts.length > 1){
			var ev;
			for (var i = 0; i < evnts.length; i++) {
				// console.log("============================================================")
				// console.log(evnts[i])
				// console.log(i)
				delField.push(evnts[i]._id);
				if(i == 0){
					ev = new Event({
						events: evnts[i].events,
						date: evnts[i].date,
						status: evnts[i].status,
						channel: evnts[i].channel,
						uniqueid: evnts[i].uniqueid,
						calleridnum: evnts[i].calleridnum,
						calleridname: evnts[i].calleridname,
						connectedlinenum: evnts[i].connectedlinenum,
						connectedlinename: evnts[i].connectedlinename
					});
					if(evnts[i].events[0].status == 'Up') {
						ev.status = "Completed";
					} else if(evnts[i].events[0].status == 'Ringing') {
						ev.calleridnum = evnts[i].connectedlinenum,
						ev.calleridname = evnts[i].connectedlinename,
						ev.connectedlinenum = evnts[i].calleridnum,
						ev.connectedlinename = evnts[i].calleridname
					}
				} else {
					// console.log(ev)
					if(ev.connectedlinenum === '' && evnts[i].connectedlinenum != ''){
						ev.connectedlinename = evnts[i].connectedlinename;
						ev.connectedlinenum = evnts[i].connectedlinenum;
					}
					if(ev.calleridnum === '' && evnts[i].calleridnum != ''){
						ev.calleridname = evnts[i].calleridname;
						ev.calleridnum = evnts[i].calleridnum;
					}
					for (var j = 0; j < evnts[i].events.length; j++) {
						ev.events.push(evnts[i].events[j])
						
						if(evnts[i].events[j].status == 'Up'){
							ev.status = "Completed";
						} else if(evnts[i].events[0].status == 'Ringing') {
							ev.calleridnum = evnts[i].connectedlinenum,
							ev.calleridname = evnts[i].connectedlinename,
							ev.connectedlinenum = evnts[i].calleridnum,
							ev.connectedlinename = evnts[i].calleridname
						}
					};
				}
				//console.log(ev)
				Event.findByIdAndRemove(evnts[i]._id, function (err, callback){
					if(err) console.log(err)
				});
			};//For loop
			console.log("////////////////////////////////////////////////////////////////")
			console.log(ev)
			console.log("////////////////////////////////////////////////////////////////")
			
			var splitCallerIdName = ev.calleridname.split('-');
			var h = 0, end = false;
                        while(h < colas.queues.length && !end) { 
                            if(splitCallerIdName[0] == colas.queues[h].code){
                                  ev.queue = colas.queues[h].name;
                                  end = true;
 	                    }
                            h++;
                        }
			ev.save();
		}
	  });//queue
	});
}
