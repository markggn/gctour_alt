

function toggleSettingsFunction(){
	return function(){
		var tourSettingsDiv = dojo.byId('tourSettingsDiv');
		if (tourSettingsDiv.style.display == 'none'){
			dojo.fx.wipeIn({
				node: tourSettingsDiv,
				duration: 400
			}).play();
 	  	} else {
			dojo.fx.wipeOut({
				node: tourSettingsDiv,
				duration: 400
			}).play();
		}
	}
}
function toggleTourListFunction(){
	return function(){
		var tourlistDiv = dojo.byId('tourlistDiv');
		if (tourlistDiv.style.display == 'none'){
			dojo.fx.wipeIn({
				node: tourlistDiv,
				duration: 400
			}).play();
 	  	} else {
			dojo.fx.wipeOut({
				node: tourlistDiv,
				duration: 400
			}).play();
		}
	}
}

function updateGUI(){
    var cacheList, i, table;

	// update the cache count	
	updateCacheCount(currentTour.geocaches.length);
	// update tourName
	dojo.byId("tourName").innerHTML = currentTour.name;
	
	// update webcode
	var webcodeSpan = dojo.byId("webcode");
	
	log(currentTour.webcode);
	if(currentTour.webcode){
		webcodeSpan.innerHTML = "<br>Webcode:<b>"+currentTour.webcode+"</b></span>"
		webcodeSpan.style.display = "inline";
	} else {
		webcodeSpan.style.display = "none";
	}
	
	// update the opendialog
	//populateAllTours();

    cacheList = document.getElementById('cacheList');	
	cacheList.innerHTML = "";
	// popultate the current list on load
	for (i = 0; i < currentTour.geocaches.length; i++){
		addNewTableCell(currentTour.geocaches[i],false);
	}

	table = dojo.byId('cacheList');	
	if(currentTour.geocaches.length == 0){
		table.innerHTML = lang['emptyList'];
	} 
}

function addOpacityEffects(element){
	element.style.opacity = '0.4';
	element.addEventListener('mouseover', addOpacityEffect(element),false);
	element.addEventListener('mouseout',  removeOpacityEffect(element),false);
}

function addOpacityEffect(element){return function(){	element.style.opacity = '1';}}
function removeOpacityEffect(element){return function(){element.style.opacity = '0.4'}}

function addHoverEffects(element){
	element.addEventListener('mouseover', addHoverEffect(element),false);
	element.addEventListener('mouseout',  removeHoverEffect(element),false);
	element.addEventListener('mousedown', addClickEffect(element),false);
	element.addEventListener('mouseup',  removeClickEffect(element),false);
	element.style.margin = '1px';
}

function addClickEffect(element){return function(){	element.style.background = '#a9b2bf';}}
function removeClickEffect(element){return function(){element.style.background = '#cdd8e8';}}
function addHoverEffect(element){return function(){element.style.margin = '0px';element.style.border = '1px solid lightgray';element.style.background = '#cdd8e8';}}
function removeHoverEffect(element){return function(){element.style.margin = '1px';element.style.border = '0px solid lightgray';element.style.background = '';}}



function openSend2GpsFunctionLocal(){
	return function(){
		if(!userName){
			alert(lang['notLogedIn']);
		} else if( currentTour.geocaches.length == 0) {
			alert(lang['emptyList']);
		} else {
			if(GM_getValue('showGpx',false)){
				window.open('http://www.geocaching.com/seek/sendtogps.aspx?guid=9d2b4990-7222-4b1c-8062-8b753af24ac5&tour=true', 's2gps', config='width=425,height=610,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=yes,directories=no,status=no');			
			} else {
				window.open('http://www.geocaching.com/seek/sendtogps.aspx?guid=9d2b4990-7222-4b1c-8062-8b753af24ac5&tour=true', 's2gps', config='width=425,height=280,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=yes,directories=no,status=no');			
			}
		}
	}
}

function downloadGPXFunction(){
	return function(){		
        var gpxForm, nameInput, contentArea, tourName, currentDate, currentDateString, dummyString;
		if(!userName){
			alert(lang['notLogedIn']);
		} else if( currentTour.geocaches.length == 0) {
			alert(lang['emptyList']);
		} else {	

			
			// add progressbar while loading
			addProgressbar();
			

			gpxForm = document.createElement('form');
			gpxForm.setAttribute('style','display:;');
			gpxForm.action = 'http://gc.madd.in/gm/download2.php';		
			gpxForm.id="gpxForm";

			gpxForm.method = 'post';
			
			nameInput = document.createElement('input');nameInput.type = 'hidden';gpxForm.appendChild(nameInput);
			nameInput.name = 'name';
			
			contentArea = document.createElement('textarea');gpxForm.appendChild(contentArea);
			contentArea.name = 'content';


			tourName = currentTour.name.replace(/\s+/g,"_").replace(/[^A-Za-z0-9_]*/g,"");

			currentDate =  new Date();
			currentDateString =  currentDate.getFullYear()+"-"+(currentDate.getMonth()+1)+"-"+currentDate.getDate()+"_"+currentDate.getHours()+"-"+currentDate.getMinutes()+"-"+currentDate.getSeconds();


			nameInput.value = 'GCTour.'+tourName+'.'+currentDateString+'.gpx';

			try {
				if (GM_getValue('gpxschema',1) == 0){
					dummyString = getGPX();	
				} else {
					dummyString = getGPXNew();
				} 

				//iff the cancel button is pressed the dummyString just contain canceled
				if(dummyString == "canceled"){
					closeOverlay();
					return;
				}

/* dont use this - it cause some serious errors!
				// pretty print the gpx
				// remove <?xml version="1.0" encoding="utf-8"?> to prevent error message from E4X
				dummyString = dummyString.replace(/^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, ""); 
				dummyString =  XML(dummyString).toXMLString();				
				// and add it again - to be sure!
				dummyString = '<?xml version="1.0" encoding="utf-8"?>\n'+dummyString;
				
*/
				

				contentArea.innerHTML = encodeURIComponent(dummyString);

				document.body.appendChild(gpxForm);
				document.getElementById('gpxForm').submit();
				document.body.removeChild(gpxForm);

				// all done - remove the overlay
				closeOverlay(); 


			} catch (e) {
				addErrorDialog({caption:"GPX error", _exception:e}); 
			}
		}
	}
}



function sendToGPS(){
    var dataStringElement, tourName, currentDate, currentDateString;
    
    
	// add the overlay while loading
	addProgressbar();  
    // change ALWAYS to Garmin
	var garmin_tab = document.getElementById('uxGPSProviderTabsn2');
	if(garmin_tab.getElementsByTagName('table')[0].className != "Selected"){
		unsafeWindow.__doPostBack('uxGPSProviderTabs','2');
		return;
	}

	try{	
		dataStringElement = document.getElementById('dataString');
		dataStringElement.value = lang['pleaseWait'];
		if (GM_getValue('gpxschema',1) == 0){
			dataStringElement.value = getGPX();	
		} else {
			dataStringElement.value = getGPXNew();
		}

		tourName = currentTour.name.replace(/\s+/g,"_").replace(/[^A-Za-z0-9_]*/g,"");

		currentDate =  new Date();
		currentDateString =  currentDate.getFullYear()+"-"+(currentDate.getMonth()+1)+"-"+currentDate.getDate()+"_"+currentDate.getHours()+"-"+currentDate.getMinutes()+"-"+currentDate.getSeconds();


		dojo.byId('cacheID').value = 'GCTour.'+tourName+'.'+currentDateString+'.gpx';

		// all done - remove the overlay
		closeOverlay();
	}catch (e){
		addErrorDialog({caption:"Send to GPSr error", _exception:e}); 
	}

}

function makeMapFunction(){
	// add the overlay while loading
	addProgressbar({caption:lang['makeMapWait']});  
	
	var markerQuery = [];
	
	for (cache_i = 0; cache_i < currentTour.geocaches.length; ++cache_i){
		var marker = currentTour.geocaches[cache_i];
		
		if(marker.id){
			markerQuery.push(marker.id);		
		} else if(marker.wptcode){
			markerQuery.push(marker.wptcode);
		} else{
			markerQuery =  [];
			break;
		}
	}
	
	get(API_HOST+'/map/check/'+markerQuery.join(","),
		function(text){
			
			var result = JSON.parse(text);
			if(result.length < 1){ // map is completly available in appengine
				GM_openInTab(getMapUrl(markerQuery.join(",")));
				closeOverlay();
			} else { 
				var geocaches = new Array();			
				var costumMarkers = new Array();
				
				for ( var i= 0; i < result.length; i++){
					var id = result[i];
					if(id.indexOf("GC") === 0){
						geocaches.push(getMapGeocache(id));
					} else {
						costumMarkers.push(getMapMarker(id));
					}
					
					setProgress(i,result.length,document);
					
				}
				
				
				var cacheObject = {};
				cacheObject.geocaches = geocaches;
				cacheObject.costumMarkers = costumMarkers;
			
				uploadMap(cacheObject, makeMapFunction);				
			}	
			
		}
	);
}

function getMapGeocache(gcid){
	var geocache = getGeocache(gcid);

	var mapCache = new Object();
	mapCache.gcid = geocache.gcid;
	mapCache.guid = geocache.guid;
	mapCache.image = geocache.image;
	mapCache.name = geocache.name;
	mapCache.difficulty = geocache.difficulty;
	mapCache.terrain = geocache.terrain;
	mapCache.latitude = geocache.lat;
	mapCache.longitude = geocache.lon;
	
	// save additional waypoints
	var additional_waypoints = geocache.additional_waypoints;
	for(waypoint_i = 0 ; waypoint_i < additional_waypoints.length; waypoint_i++){
		additional_waypoints[waypoint_i].note = "";
	}				
	
	mapCache.additional_waypoints = additional_waypoints;
	
	return mapCache;
}

function getMapMarker(markerId){
	var marker = currentTour.geocaches[getPositionsOfId(markerId)];
	marker.index = cache_i;
	
	return marker;
}



function uploadTourFunction(id){
	return function(){ 
	    var i, geocaches, cache_i, costumMarker, geocache, mapCache, waypoint_i, codeString,costumMarkers;
		try{
			if(!userName){
				alert(lang['notLogedIn']);
			} else if( currentTour.geocaches.length == 0) {
				alert(lang['emptyList']);
			} else {	
				
		
				for (i = 0; i < tours.length; i++){
					if(tours[i].id == id){
											
						// add the overlay while loading
						addProgressbar();
						if (GM_getValue('uploadMap',true)){ // TODO - upload Map noch gewünscht?
							//create the overview map
							geocaches = new Array();			
							costumMarkers = new Array();
							
							for (cache_i = 0; cache_i < tours[i].geocaches.length; ++cache_i){
								
								if(GM_getValue("stopTask",false) && cache_i != 0){
									GM_setValue("stopTask",false);
									closeOverlay();
									break;
								} else if (GM_getValue("stopTask",false) && cache_i == 0 ) {
									GM_setValue("stopTask",false);
								}
								costumMarker = (typeof(tours[i].geocaches[cache_i].latitude) != "undefined");
								if(!costumMarker){
								    mapCache = getMapGeocache(tours[i].geocaches[cache_i].id);
									geocaches.push(mapCache);
								} else {
									var cm = tours[i].geocaches[cache_i];
									cm.index = cache_i;
									costumMarkers.push(cm);
								}
								
								setProgress(cache_i,tours[i].geocaches.length,document);
							}	
						}
						
						
						// create request
						var tourObject = currentTour;
						tourObject.geocaches = geocaches;
						tourObject.costumMarkers = costumMarkers;
						tourObject.password = currentTour.password;
						upload(tourObject);
					
						
						break;
					}
				}
			}
		} catch(e){addErrorDialog({caption:"Upload tour error", _exception:e});}	
	}
}


function uploadMap(markerObj,callback){
	
	var jsonMap = JSON.stringify(markerObj).replace(/&/g," and ");// IMPORTANT! prevents critical errors in webapplication 
	
	
	post(API_HOST+'/map/save', "map="+jsonMap,callback);
}


function upload(tour){
		if( !tour.password){ // vllt doch mit !tour.uuid || ????
			var pw = prompt("passwort");  
			if(!pw){ 
				closeOverlay();
				return;
			}
			tour.password = pw;
			
			upload(tour);
		} else {
			
			// maybe there are more CHARS than only '&'!
			var jsonTour = JSON.stringify(tour).replace(/&/g," and ");// IMPORTANT! prevents critical errors in webapplication 			
			
			post(API_HOST+'/tour/save', "tour="+jsonTour,
				function(text){
					
					var tourServer = JSON.parse(text);
					// after an error you get this result, eg:
					// {"message":"wrong password","type":"error"}
					
					// only if the result is a message
					if(tourServer.message && tourServer.type == "error"){
							var pw = prompt("falsches Passwort - bitte richtiges eingeben");   // TODO !!! LANGUAGES!!
							
							//if pw is empty or dialog closed
							if(!pw){ 
								closeOverlay();
								return;
							}
							tour.password = pw;		
							upload(tour);
					} else if (tourServer.message && tourServer.type == "info"){
						alert(tourServer.message);
						closeOverlay();						
					} else {	 // result is a tour and could be saved  - all done
					
					
						// remaind to local id!!
						tourServer.id = tour.id;
						
						// and the password
						tourServer.password = tour.password;
						
						
						currentTour = tourServer;
						saveCurrentTour();
						
						checkOnlineConsistent(currentTour);
						
						
						updateTour();
						
					
						
						closeOverlay();
					}
						
				
					
				}
		    );
	    

		}
}

function openSend2GpsDialog(){
	if(!userName){
		alert(lang['notLogedIn']);
	} else if( currentTour.geocaches.length == 0) {
		alert(lang['emptyList']);
	} else {	
		var overlay= getOverlay({caption:"Send to GPS"});
		overlay.innerHTML = "<iframe src='http://www.geocaching.com/seek/sendtogps.aspx?guid=9d2b4990-7222-4b1c-8062-8b753af24ac5&tour=1' width='450px' height='350' scrolling='no' marginheight='0' marginwidth='0' frameborder='0'></iframe>";
	}
	
}

function openSettingsDialog(){
	var settings = new Settings();
	settings.show();
}


function sendMessageDialog(){
	 
	 if(!userName){
		alert(lang['notLogedIn']);
		return;
	}

	 
	 
	var overLay = getOverlay({caption:lang['sendMessageTitle'],minimized:true});
	
	
	overLay.innerHTML = '<form method="POST" action="'+GCTOUR_HOST+'/contact"> \
	'+lang["sendMessage"]+'<br/> \
	<input type="hidden" name="redir" value='+window.location+'> \
	<input type="hidden" name="user" value='+userName+'> \
	<textarea rows="10" style="width:99%" name="message"></textarea> \
	<div class="dialogFooter"><input style="background-image:url('+sendMessageImage+')" type="submit" name="send" value="'+lang['sendMessageSubmit']+'"></input></div>\
	</form>';
	
	//<div class="dialogFooter"><input style="background-image:url('+sendMessageImage+')" "type="submit" name="send" value="'+lang['sendMessageSubmit']+'"></input>\
	
}


function populateTours(){
	var tourList = dojo.byId('dialogListContainer');
	tourList.innerHTML = "";
	
	var tourListUl = createElement('ul');	
	tourListUl.setAttribute("class", "dialogList");
	append(tourListUl,tourList);
	
	
	//construct tour list
	for (var tourIt = 0; tourIt<tours.length; tourIt++){
		var tour = tours[tourIt];
		var tourListLi = createElement('li',{id:"tour"+tour.id});append(tourListLi,tourListUl);
			
		
		
		var tourLink;
		// make the current Tour not clickable nor deletable!
		
		
		tourLink = createElement('a',{style:"cursor:pointer;font-size:10px;color:#003399"});
		tourLink.innerHTML = tour.name+"&nbsp;<small>("+tour.geocaches.length+")</small>";
		
		
		
		if(tour.id == currentTour.id){				
			//~ tourListLi.setAttribute("class", "activeTour");
			tourLink.innerHTML = "<b>"+tourLink.innerHTML+"</b>";
		} else {			
			//~ var deleteButton = document.createElement('img',{title:lang['removeTour'],src:""+deleteImageString,style:"cursor:pointer;margin-right:5px:float:right;"});
			
			
			var deleteButton = document.createElement('img');
			deleteButton.title = lang['removeTour'];
			deleteButton.src = deleteImageString;
			deleteButton.style.cursor = 'pointer';
			deleteButton.style.marginRight = '5px';
			deleteButton.style.cssFloat = 'right';
			
			deleteButton.addEventListener('click',deleteTourFunction(tours[tourIt].id), false);
			append(deleteButton,tourListLi);	
			
		}	
		
		if(tour.webcode){
			var webImage = createElement('img',{src:globeImage,style:"float:left;margin-right:3px;"});
			tourLink.appendChild(webImage);
		}	
		
		tourLink.addEventListener('click', showCacheList(tour),false);		
		append(tourLink,tourListLi);
			

			
			
	}	
}
	

function openTourDialog(){
	var overLay = getOverlay({caption:lang['openTour']});
	
	
	var tourList = createElement('div',{id:"dialogListContainer"});append(tourList,overLay);
	var cacheList = createElement('div',{id:"dialogDetails"});append(cacheList,overLay);
	
	populateTours();
	
	
	
	
	// load,close buttons
	var buttonsDiv = createElement('div',{style:"width:480px;position: absolute; bottom: 10px;"});append(buttonsDiv,overLay);
		buttonsDiv.setAttribute('class','dialogFooter');
	
	
	var closeButton = createElement('input',{type:"button",value:lang["cancel"],style:"background-image:url("+closebuttonImage+")"});append(closeButton,buttonsDiv);
		closeButton.addEventListener('click', closeOverlay, false);
		
		
	var loadButton = createElement('input',{type:"button",value:lang['load'],disabled:"",id:"loadButton",style:"background-image:url("+openTourImageString+")"});append(loadButton,buttonsDiv);
		loadButton.addEventListener('click', function(){
			var id = dojo.byId("dialogDetails").getAttribute("tourid");
			loadTour(id)();
			closeOverlay();
		}, false);
		
		
	
	// load currentTour
	showCacheList(currentTour)();
	
	loadButton.setAttribute("disabled","disabled");

}

function showCacheList(tour){
	return function(){
		var cacheList = document.getElementById('dialogDetails');
		cacheList.scrollTop=0;
		cacheList.setAttribute("tourid", tour.id);

		

		cacheList.innerHTML = "<u><b>"+tour.name+"</b>";
		if(tour.webcode){
			cacheList.innerHTML += "&nbsp;&nbsp;&nbsp;<i>Webcode:"+tour.webcode+"</i>";
		}
		cacheList.innerHTML += "</u><br/>";
		
		
				
		var copyButton = document.createElement('img');
		copyButton.title = lang['copyTour'];
		copyButton.src = copyImage;
		copyButton.style.cursor = 'pointer';
		copyButton.style.marginRight = '5px';
		copyButton.style.cssFloat = 'right';
		copyButton.addEventListener('click',function(){
			
			var newTour = eval(uneval(tour));
			newTour.id = getNewTourId();
			

			
			
			if(newTour.name.endsWith(lang_eng['copy']) || newTour.name.endsWith(lang_ger['copy'])){
			} else {
				newTour.name = newTour.name + " - "+lang['copy'];
			}
			
			
			tours.push(newTour);
			log("Creating copy tour: "+newTour.id +" ; "+ newTour.name);
			
			saveTour(newTour,true);
			
			populateTours();
			
			showCacheList(newTour)();
		},false);
		
				
		var deleteButton = document.createElement('img');
		deleteButton.title = lang['removeTour'];
		deleteButton.src = deleteImageString;
		deleteButton.style.cursor = 'pointer';
		deleteButton.style.marginRight = '5px';
		deleteButton.style.cssFloat = 'right';
		deleteButton.addEventListener('click',deleteTourFunction(tour.id), false);
		
		
		var renameButton = document.createElement('img');
		renameButton.src = editImageString;
		renameButton.title = lang['rename'];
		renameButton.alt = lang['rename'];
		renameButton.style.cursor = 'pointer';
		renameButton.style.marginRight = '5px';
		renameButton.style.cssFloat = 'right';
		renameButton.addEventListener('click', 
		function(){
			var newTourName = prompt(lang['newTourDialog'], tour.name);  
			if(!newTourName) return;
			tour.name = newTourName;
			saveTour(tour,true);
			populateTours();
			
			showCacheList(tour)();   				
			},false);
		
		
		
		
		
						
		if(tour.id != currentTour.id){	
			cacheList.insertBefore(deleteButton,cacheList.firstChild);
		}
	
		cacheList.insertBefore(renameButton,cacheList.firstChild);
		cacheList.insertBefore(copyButton,cacheList.firstChild);
		
		
			

		
		
		var cacheListUl = createElement('ul');
		cacheListUl.setAttribute("class", "dialogList");
		
		for (var cacheIt = 0; cacheIt<tour.geocaches.length; cacheIt++){
			var geocache = tour.geocaches[cacheIt];
			
			var cacheListLi = createElement('li',{style:"b"});append(cacheListLi,cacheListUl);
			cacheListLi.innerHTML = "<img src='"+geocache.image+"' style='margin-left=10px'> "+geocache.name+"&nbsp;<small>("+((geocache.id != undefined)?geocache.id:geocache.wptcode)+")</small>";
			
		
		}
		append(cacheListUl,cacheList);
		
		// make loadButton available
		
		
		var loadButton = document.getElementById('loadButton');
		loadButton.value = "'"+tour.name+"' "+lang['load'];
		loadButton.removeAttribute('disabled');
		
		
		
		// first remove all active tour css classes
		dojo.query("ul[class='dialogList'] > li").removeClass("activeTour");
		//and then set it to the clicked
		document.getElementById('tour'+tour.id).setAttribute("class", "activeTour");
	}
}


function downloadTourDialog(){
	var overlay= getOverlay({caption:lang["webcodeDownloadButton"],minimized:true});
	
	var divEbene = createElement('div');append(divEbene,overlay);

	divEbene.innerHTML = '<b>Webcode:</b>&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="webcodeInput"><br/>\
						'+lang['webcodeDownloadHelp'];
	
	
	
	divEbene = createElement('div');append(divEbene,overlay);
	divEbene.setAttribute('class','dialogFooter');
	
	var downloadButton = createElement('input',{type:"button",value:lang["webcodeDownloadButton"],style:"background-image:url("+downloadImageString+")"});append(downloadButton,divEbene);
	downloadButton.addEventListener('click',function(){
		var webcode = trim(dojo.byId('webcodeInput').value);
		if(webcode == "")
			return;
		downloadTourFunction(webcode);	
	},false);
	
}


function downloadTourFunction(webcode){
    var details;

	// add the overlay while loading
	addProgressbar();

	details = new Object();
	details.method = 'GET';
	//~ details.url = 'http://gctour.madd.in/query.php?crc='+trim(webcode);
	details.url = API_HOST+'/tour/'+trim(webcode)+'/json';
	details.onload = function(response) {
		var onlineTour;
		try{
			var responseObject = JSON.parse(response.responseText);
			
			if (responseObject.type == "error" && responseObject.message == "no tour"){
				alert(lang['webcodeerror']);
			
			} else if (responseObject.type == "oldtour"){
				onlineTour = eval(responseObject.message);
				onlineTour.id = getNewTourId();		
				tours.push(onlineTour);
				saveCurrentTour();

				log("Download of an old online tour successfull: "+onlineTour.id +" ; "+ onlineTour.name);
				
				alert("'"+onlineTour.name+"'"+lang['webcodesuccess'] +"\n"+ lang['webcodeOld']+"\n\n");

				loadTour(onlineTour.id)();

			} else {
				onlineTour = responseObject;
				onlineTour.id = getNewTourId();	
				
				tours.push(onlineTour);
				saveCurrentTour();
				
				alert("'"+onlineTour.name+"'\n"+lang['webcodesuccess']);
				
				loadTour(onlineTour.id)()
			}
			
			closeOverlay();
		} catch(e){
			addErrorDialog({caption:"Download tour error", _exception:e});
		}
	};
	GM_xmlhttpRequest(details);	
}


function showInformationDiv(tour){
	return function(){
	    var infomationDiv, i;
	
		infomationDiv = document.createElement('div');
		document.body.appendChild(infomationDiv);



		infomationDiv.id = "infomationDiv";
		infomationDiv.style.position = "fixed";
		infomationDiv.style.right = "15%";
		infomationDiv.style.top = "30px";
		infomationDiv.style.textAlign = "left";
		infomationDiv.style.padding = "10px";

		infomationDiv.style.border  = '1px solid #448e35';
		infomationDiv.style.backgroundColor  = '#c6e3c0';

		infomationDiv.innerHTML = "<b>"+tour.name+" ("+tour.geocaches.length+ " Caches)</b><br/>";

		for(i = 0; i < tour.geocaches.length ; i++){
			if(i > 20){
				infomationDiv.innerHTML += "... (" +(tour.geocaches.length - i) +" more) ...";
				break;
			}
			infomationDiv.innerHTML +=  "<div style='border-bottom: 1px dotted  #448e35'> <img src='"+tour.geocaches[i].image+"' style='margin-left=10px'> "+tour.geocaches[i].name + "</div>";
		}
	};
}
