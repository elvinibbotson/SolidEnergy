function id(el) {
	return document.getElementById(el);
}
function pad(n) {
	// console.log('pad '+n+' to 5 chars - starting from '+n.length);
	var num=n;
	// console.log('n: '+n+' ('+n.length+' chars)');
	while(num.length<5) num='&nbsp;'+num;
	return num;
}
'use strict';
// GLOBAL VARIABLES
var scr={}; // screen size .w & .h and cursor coordinates .x & .y
// var db=null;
var logs=[];
var log=null;
var logIndex=null;
var currentLog=null;
var view='listView';
var currentDialog=null;
var dragStart={};
var canvas=null;
var background=null;
var canvasL=0;
var intervalX=0;
var intervalY=0;
var months="JanFebMarAprMayJunJulAugSepOctNovDec";
var latest;
// solid session & authentication...
const auth=solidClientAuthentication;
const session=auth.getDefaultSession();
// DRAG TO GO BACK
id('main').addEventListener('touchstart', function(event) {
    // console.log(event.changedTouches.length+" touches");
    dragStart.x=event.changedTouches[0].clientX;
    dragStart.y=event.changedTouches[0].clientY;
    // console.log('start drag at '+dragStart.x+','+dragStart.y+' view is '+view);
})
id('main').addEventListener('touchmove', function(event) {
	var x=event.changedTouches[0].clientX-dragStart.x;
	x+=canvasL;
	id('graphPanel').style.left=x+'px';
	// id('graphBackground').style.left=0;
	console.log('graphPanel.x: '+x+';  background.x: '+id('graphBackground').style.left);
})
id('main').addEventListener('touchend', function(event) {
    var drag={};
    drag.x=dragStart.x-event.changedTouches[0].clientX;
    drag.y=dragStart.y-event.changedTouches[0].clientY;
    // console.log('drag '+drag.x+','+drag.y+' view is '+view);
    if(view=='listView') {
    	if(Math.abs(drag.y)>50) return; // ignore vertical drag
    	if(drag.x<-50) { // drag right to show graph
    		console.log('drag.x is '+drag.x);
    		view='graph';
    		id('listPanel').style.display='none';
    		id('heading').style.display='none';
    		id('buttonNew').style.display='none';
    		drawGraph();
    	}
    	// else if((drag.x>50)&&(currentDialog)) toggleDialog(currentDialog,false); // drag left to close dialog
    }
    else { // drag vertically to return to list view
    	canvasL-=drag.x;
    	// console.log('canvas left: '+canvasL);
    	if(Math.abs(drag.x)>50) return; // ignore horizontal drags
    	if(Math.abs(drag.y)>50) {
    		view='listView';
    		id('graphPanel').style.display='none';
    		id('graphBackground').style.display='none';
    		id('listPanel').style.display='block';
    		id('heading').style.display='block';
    		id('buttonNew').style.display='block';
    	}
    }
})
// TAP SYNC ICON
id('buttonSync').addEventListener('click',sync)
// NEW BUTTON
id('buttonNew').addEventListener('click', function() { // show the log dialog
	console.log("show add log dialog with today's date and delete button disabled");
	var d=new Date().toISOString();
	id('logDate').value=d.substr(0,10);
	id('logGrid').value=null;
	id('logPVa').value=null;
	id('logPVb').value=null;
	id('logYield').value=null;
	id('logCons').value=null;
	log={};
	id("buttonDeleteLog").style.display='none';
	// id("buttonDeleteLog").disabled=true;
	// id('buttonDeleteLog').style.color='gray';
	id('buttonAddLog').style.display='block';
	// id('button.addLog').disabled=false;
	id('buttonSaveLog').style.display='none';
	// id('button.saveLog').disabled=true;
	toggleDialog('logDialog',true);
});
// ADD NEW LOG
id('buttonAddLog').addEventListener('click',function() {
	log.date=id('logDate').value;
	log.grid=id('logGrid').value;
	log.pvA=id('logPVa').value;
	log.pvB=id('logPVb').value;
	log.yield=id('logYield').value;
	log.cons=id('logCons').value;
    toggleDialog('logDialog',false);
    console.log("add new log - date: "+log.date);
	logs.push(log);
	save();
	populateList();
})
// SAVE EDITED LOG
id('buttonSaveLog').addEventListener('click', function() {
	log.date=id('logDate').value;
	log.grid=id('logGrid').value;
	log.pvA=id('logPVa').value;
	log.pvB=id('logPVb').value;
	log.yield=id('logYield').value;
	log.cons=id('logCons').value;
    toggleDialog('logDialog',false);
	console.log("save log - date: "+log.date);
	save(); // WAS saveData();
	populateList();
});
// DELETE LOG
id('buttonDeleteLog').addEventListener('click', function() {
	var text=log.date; // initiate delete log
	console.log("delete log date "+text+' show confirm dialog');
	toggleDialog("deleteDialog", true);
	id('deleteText').innerHTML=text;
});
// CONFIRM DELETE
id('buttonDeleteConfirm').addEventListener('click', function() {
	console.log("delete log - "+logIndex); // confirm delete log
	console.log('date: '+log.date);
	logs.splice(logIndex,1);
	save(); // WAS saveData();
	populateList();
	toggleDialog('deleteDialog', false);
});
// CLOSE DIALOG
id('curtain').addEventListener('click',function() {
	toggleDialog(currentDialog,false);
})
// SHOW/HIDE DIALOGS
function  toggleDialog(d, visible) {
    console.log('toggle '+d+' - '+visible);
    if(currentDialog) id(currentDialog).style.display='none';
    if(visible) {
    	currentDialog=d;
    	id(d).style.display='block';
    }
    id('buttonNew').style.display=(visible)?'none':'block';
    id('curtain').style.height=(visible)?'100%':'0';
}
// OPEN SELECTED LOG FOR EDITING
function openLog() {
	console.log("open log: "+logIndex);
	log=logs[logIndex];
	console.log('log date: '+log.date);
	toggleDialog('logDialog',true);
	id('logDate').value=log.date;
	id('logGrid').value=log.grid;
	id('logPVa').value=log.pvA;
	id('logPVb').value=log.pvB;
	id('logYield').value=log.yield;
	id('logCons').value=log.cons;
	id('buttonDeleteLog').style.display='block';
	// id('buttonDeleteLog').disabled=false;
	// id('buttonDeleteLog').style.color='red';
	id('buttonAddLog').style.display='none';
	// id('buttonAddLog').disabled=true;
	id('buttonSaveLog').style.display='block';
	// id('buttonSaveLog').disabled=false;
}
// POPULATE LOGS LIST
function populateList() {
	/*
	console.log("populate log list");
	logs=[];
	var data=window.localStorage.getItem('logs');
	logs=JSON.parse(data);
	if(!logs || logs.length<1) {
		toggleDialog('dataDialog',true);
		return;
	}
	logs.sort(function(a,b) { return Date.parse(a.date)-Date.parse(b.date)}); // date order
	*/
	console.log("populate list with "+logs.length+' logs');
	id('list').innerHTML=""; // clear list
	var html="";
	var d="";
	var mon=0;
  	for(var i=logs.length-1; i>=0; i--) { // list latest first
  		// console.log('log '+i+': '+logs[i].grid+'kWh');
  		var listItem=document.createElement('li');
		listItem.index=i;
	 	listItem.classList.add('log-item');
		listItem.addEventListener('click', function(){logIndex=this.index; openLog();});
		var itemText=document.createElement('span');
		d=logs[i].date;
		mon=parseInt(d.substr(5,2))-1;
		mon*=3;
		d=months.substr(mon,3)+" "+d.substr(2,2);
		html='<span class="grey">'+d+'</span><span class="red">'+pad(logs[i].grid)+'</span><span class="green">'+pad(logs[i].pvA)+'</span><span class="blue">'+pad(logs[i].pvB)+'</span><span class="yellow">'+pad(logs[i].yield)+'</span><span class="orange">'+pad(logs[i].cons)+'</span>';
		itemText.innerHTML=html;
		listItem.appendChild(itemText);
		id('list').appendChild(listItem);
  	}
}
// DRAW GRAPH
function drawGraph() {
	var letters='JFMAMJJASOND';
	var margin=90; // bottom margin to allow space for Android controls
	var intervalV=100; // 100kWh interval for horizontal gridlines
	var n=logs.length-1;
	console.log('graph spans '+n+' months');
	console.log('screen width: '+scr.w+'; intervalX: '+intervalX);
	canvasL=(14-n)*intervalX;
	console.log('start with canvasL: '+canvasL);
	id('graphPanel').style.left=canvasL+'px';
	id("graphPanel").style.width=(n*intervalX+10)+'px';
	id('canvas').width=n*intervalX+10;
	id('graphBackground').style.display='block';
	id('graphPanel').style.display='block';
	// clear canvases
	background.clearRect(0,0,scr.w,scr.h);
	canvas.clearRect(0,0,id('canvas').width+10,scr.h);
	background.fillStyle='black';
	background.fillRect(0,0,scr.w,24); // header - black background
	background.font='20px Monospace';
	background.fillStyle='hotpink';
	background.fillText('grid',25,20);
	background.fillStyle='lightgreen';
	background.fillText('PV',115,20);
	background.fillStyle='yellow';
	// background.fillText('pvB',150,20);
	// background.fillStyle='skyblue';
	background.fillText('heat',205,20);
	background.fillStyle='orange';
	background.fillText('ASHP',295,20);
	background.lineWidth=1;
	// draw horizontal gridlines and kWh labels on background
	for(i=0;i<11;i++) background.fillText(i*intervalV,2,scr.h-margin-i*intervalY-5); // kWh at 100px intervals
	background.fillText('kWh',2,scr.h-margin-11*intervalY+20); // vertical axis label
	background.strokeStyle='silver'; // grey lines
	background.beginPath();
	for(i=0;i<12;i++) {
		background.moveTo(0,scr.h-margin-i*intervalY);
		background.lineTo(scr.w,scr.h-margin-i*intervalY); // grey lines
	}
	background.stroke();
	// DRAW GRAPHS
	var startLog=1; // defaults to second log (for month intervals)
	var mon=-1;
	var step=1;
	canvas.strokeStyle='silver'; // grey lines
	canvas.font='20px Monospace';
	canvas.fillStyle='white'; // white text
	console.log('draw vertical gridlines');
	canvas.beginPath();
	var i=startLog-step;
	console.log('first gridline is for '+logs[i].date+'; startLog is '+startLog);
	var m=0;
	var year=0;
	while(i<logs.length) {
		x=Math.floor(i/step)*intervalX;
		console.log('gridline '+i+' at '+x);
		canvas.moveTo(x,scr.h-margin);
		canvas.lineTo(x,scr.h-margin-12*intervalY); // vertical gridline
		m=parseInt(logs[i].date.substr(5,2))-1;
		canvas.fillText(letters.charAt(m),x-5,scr.h-margin-11*intervalY-5); // month letter just above and below grid
		canvas.fillText(letters.charAt(m),x-5,scr.h-margin-5);
		if(m<1) {
				year=logs[i].date.substr(0,4);
				canvas.fillText(year,x,scr.h-margin-11*intervalY-24); // YYYY above month labels
			}
		i+=step;
	}
	canvas.stroke();
	// first draw grid power usage
	canvas.strokeStyle='hotpink';
	canvas.setLineDash([]);
	canvas.lineWidth=3;
	canvas.beginPath();
	i=startLog;
	x=(Math.floor(i/step)-1)*intervalX;
	var val=0;
	console.log('start from log '+i+' grid');
	while(i<logs.length) {
		val=logs[i].grid-logs[i-step].grid; // kWh
		val*=intervalY/intervalV; // convert kWh to pixels
		x+=intervalX;
		var y=scr.h-margin-val;
		if(i==startLog) canvas.moveTo(x,y);
		else canvas.lineTo(x,y);
		i+=step;
	}
    canvas.stroke();
    // next draw PV yield
    console.log('PV');
    canvas.strokeStyle='lightgreen';
    canvas.setLineDash([]);
    canvas.beginPath();
    i=startLog;
    x=(Math.floor(i/step)-1)*intervalX;
    while(i<logs.length) {
		val=(logs[i].pvA-logs[i-step].pvA)+(logs[i].pvB-logs[i-step].pvB); // kWh
		val*=intervalY/intervalV; // convert kWh to pixels
		x+=intervalX
		var y=scr.h-margin-val;
		if(i==startLog) canvas.moveTo(x,y);
		else canvas.lineTo(x,y);
		i+=step;
	}
	canvas.stroke();
	/*
	PVb yield
	console.log('PVb');
	canvas.strokeStyle='yellow';
	canvas.setLineDash([]);
    canvas.beginPath();
    i=startLog;
    x=(Math.floor(i/step)-1)*intervalX;
    while(i<logs.length) {
    	val=logs[i].pvB-logs[i-step].pvB; // kWh
		val*=intervalY/intervalV; // convert kWh to pixels
		x+=intervalX;
		var y=scr.h-margin-val;
		if(i==startLog) canvas.moveTo(x,y);
		else canvas.lineTo(x,y);
		i+=step;
    }
	canvas.stroke();
	*/
	// heat pump yield...
	console.log('yield');
	canvas.strokeStyle='yellow';
	canvas.setLineDash([]);
    canvas.beginPath();
    i=startLog;
    x=(Math.floor(i/step)-1)*intervalX;
    while(i<logs.length) {
		val=logs[i].yield-logs[i-step].yield; // kWh
		val*=intervalY/intervalV; // convert kWh to pixels
		x+=intervalX;
		var y=scr.h-margin-val;
		if(i==startLog) canvas.moveTo(x,y);
		else canvas.lineTo(x,y);
		i+=step;
	}
	canvas.stroke();
	// heat pump input...
	console.log('usage');
	canvas.strokeStyle='orange';
    canvas.beginPath();
    i=startLog;
    x=(Math.floor(i/step)-1)*intervalX;
    while(i<logs.length) {
    	val=logs[i].cons-logs[i-step].cons; // kWh
		val*=intervalY/intervalV; // convert kWh to pixels
		x+=intervalX;
		var y=scr.h-margin-val;
		if(i==startLog) canvas.moveTo(x,y);
		else canvas.lineTo(x,y);
		i+=step;
    }
	canvas.stroke();
}
function selectLog() {
	if(currentLog) currentLog.children[0].style.backgroundColor='gray'; // deselect any previously selected item
    itemIndex=parseInt(logIndex);
	log=logs[logIndex];
	console.log("selected item: "+logIndex);
	currentLog=id('list').children[logIndex];
	currentLog.style.backgroundColor='black'; // highlight new selection
}
// DATA
function load() {
	var data=localStorage.getItem('EnergyData');
	if(!data) {
		message('No data - sync');
		return;
	}
	console.log('data: '+data.length+' bytes');
    logs=JSON.parse(data).logs;
    console.log(logs.length+' logs read');
    logs.sort(function(a,b) {return Date.parse(a.date)-Date.parse(b.date)}); // date order
	populateList();
}
function save() {
	var data=JSON.stringify(logs);
	window.localStorage.setItem('EnergyData',data);
	console.log('data saved to EnergyData');
	latest=new Date().toString();
	window.localStorage.setItem('latest',latest);
}
// SOLID CODE
function connect() {
	console.log('CONNECT - logging in');
	try {
		auth.login({
    		oidcIssuer:"https://privatedatapod.com",
    		redirectUrl:window.location.href,
    		clientName:"SolidLists"
    	});
	}
	catch(error) {console.error(error.message);}
}
auth.handleIncomingRedirect({restorePreviousSession:true}).then(function(){
	if(session.info.isLoggedIn) {
		console.log('logged in as '+session.info.webId);
		message('LOGGED IN',false);
    	sync();
	}
});
async function sync() {
	if(!session.info.isLoggedIn) {connect(); return;} // ensure connected
	latest=window.localStorage.getItem('latest');
	console.log('latest is '+latest);
	message('SYNC - DOWNLOAD?',true);
	var response=await session.fetch('https://elvinibbotson.privatedatapod.com/drive/SolidEnergyData.json',
	{ // ONLY RESTORE DATA FROM POD IF NEWER THAN CURRENT LOCAL DATA
		method: 'GET',
		headers: {'If-Modified-Since':latest}
	});
	console.log('response: '+response.ok);
	if(response.ok) {
		var body=await response.json();
		console.log('response - last modified: '+response.lastModified);
		logs=body.logs;
		message(logs.length+' logs downloaded',false);
		save();
	}
	else { // local data is newer - upload to pod
		message('no download - UPLOAD',false);
		upload();
	}
	load(); // ensure working with latest dataset
}
async function upload() {
	if(!session.info.isLoggedIn) {connect(); return;} // ensure connected
  	console.log("UPLOAD");
	var fileName="drive/SolidEnergyData.json";
	console.log(logs.length+" logs - save");
	var data={'logs': logs};
	var json=JSON.stringify(data);
	try {
		response=await session.fetch('https://elvinibbotson.privatedatapod.com/'+fileName,{
			method:'PUT',
			headers:{'Content-Type':'application/json'},
			body:json
		});
		if(!response.ok) {
    		throw new Error(`Response status: ${response.status}`);
    	}
    	console.log('backup saved, status: '+response.status);
    	message(logs.length+' logs saved');
	}
	catch (error) {console.error(error.message);alert(error.message);}
}
// DISPLAY MESSAGE
function message(text) {
	id('message').innerText=text;
	toggleDialog('messageDialog',true);
}
// START-UP CODE
scr.w=screen.width;
scr.h=screen.height;
console.log('screen size: '+scr.w+'x'+scr.h+'px');
id('main').style.width=scr.w+'px';
intervalX=scr.w/14; // 14 intervals visible across graph
intervalY=scr.h/14; // 14 intervals vertically 
console.log('intervals: '+intervalX+'x'+intervalY+'px');
id("canvas").width=scr.w;
id("canvas").height=scr.h;
console.log('canvas size: '+id("canvas").width+'x'+id("canvas").height);
id("background").width=scr.w;
id("background").height=scr.h;
canvas=id('canvas').getContext('2d');
background=id('background').getContext('2d');
latest=window.localStorage.getItem('latest');
console.log('latest change: '+latest);
load();
// implement service worker if browser is PWA friendly 
if (navigator.serviceWorker.controller) {
	console.log('Active service worker found, no need to register')
} else { //Register the ServiceWorker
	navigator.serviceWorker.register('sw.js', {
		scope: '/SolidEnergy/'
	}).then(function(reg) {
		console.log('Service worker has been registered for scope:'+ reg.scope);
	});
}
