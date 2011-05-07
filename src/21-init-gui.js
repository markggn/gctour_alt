function initButton(){
	
	 // if we are on a cache page the buttonGroup != null - so add the 'to tour'-button

	var cacheControl = dojo.query("div[class='CacheInformationTable']")[0];
	if (cacheControl != null){
		
		
		var div_element = createElement('div',{style:"border-top: 1px solid rgb(192, 206, 227);"});append(div_element,cacheControl);

		
		
		var gcTourFieldset = createElement('fieldset',{style:"background-color: #EFF4F9;border-color: #C0CEE3 !important;margin-top:0;padding: 0.5em;"});append(gcTourFieldset,div_element);
		gcTourFieldset.setAttribute('class','dialogFooter');
		gcTourFieldset.innerHTML = "<legend class='note' style='background:url(\""+gctourLogoSmall+"\") no-repeat scroll 0 0 transparent'>GCTour</legend>";

		var newButton = createElement('input',{type:"button",value:lang["addToTour"],style:"float:left;background-image:url("+addToTourImageString+")"});append(newButton,gcTourFieldset);
		newButton.setAttribute('onclick','return false;');	
				
		//~ var newButton = document.createElement("button");
		//~ newButton.name = 'btnGPXDL';
		//~ newButton.type = 'submit';
		//~ newButton.innerHTML = "<img src='"+addToTourImageString+"'/>&nbsp;"+lang['addToTour'];
		//~ newButton.id = 'btnGPXDL';	
		
		
		// locate the values and save it
		var cacheIdCode = document.getElementById('ctl00_ContentBody_uxWaypointName');
		var cacheId = trim(cacheIdCode.textContent);
		
		// get the guid
		var guidId = dojo.query("a[id='ctl00_ContentBody_lnkPrintFriendly5Logs']")[0].href.split("guid=")[1].split("&")[0];
		
		var cacheName = trim(document.getElementById('ctl00_ContentBody_CacheName').textContent);

		var cacheTypeImage = getElementsByAttribute('title',"About Cache Types")[0].getElementsByTagName('img')[0].src.split("/")[5];
		
		// on click add an element	
		newButton.addEventListener('click', addElementFunction(cacheId,guidId,cacheName,cacheTypeImage), false);
		
		// add it to the group
		//~ append(newButton,add_button)
		//~ append(newButton,gcTourFieldset)

		// make direct print button 
		newButton = createElement('input',{type:"button",value:lang["directPrint"],style:"float:left;background-image:url("+printerImageString+")"});append(newButton,gcTourFieldset);
		newButton.setAttribute('onclick','return false;');	
		
		// on click add an element	
		newButton.addEventListener('click', function(){
				var entry = new Object();
				entry.id = cacheId;		
				entry.name = cacheName;
				entry.guid = guidId;
				entry.image = 'http://www.geocaching.com/images/WptTypes/sm/'+cacheTypeImage;


				temp_tour = new Object();
				temp_tour.name = entry.name;
				temp_tour.geocaches = new Array(entry);
				
				printPageFunction(temp_tour)();
			
		}, false);
		
		
		append(newButton,gcTourFieldset)
		
		
		// change coordinates
		newButton = createElement('input',{type:"button",value:lang['moveGeocache'],style:"float:left;background-image:url(http://www.geocaching.com/images/icons/coord_update.gif)"});append(newButton,gcTourFieldset);
		newButton.setAttribute('onclick','return false;');	
		newButton.addEventListener('click', openChangeCoordinates, false);				
		append(newButton,gcTourFieldset)
		
		
		
		// update the coordinates if it is already changed:
		
		if(GM_getValue('coords_'+cacheId,"null") != "null"){
			var coords_cacheId = GM_getValue('coords_'+cacheId);
			changeCoordinates(Dec2DM_String(coords_cacheId.split('#')[0], coords_cacheId.split('#')[1]));
			
		}		
	
	}	
}


// the tour list under main navigation
function initComponents(){
	//~ var thisDiv = getElementsByAttribute('class','widget-navigation')[0];
	
	var menuButton = createElement('div',{
		style:'height: 35px !important;\
		padding: 0 !important;\
		position: fixed !important;\
		top: 100px !important;\
		width: 35px !important;\
		z-index: 100001 !important;\
		border: 1px solid #333333;border-width: 1px 1px 1px 0;border-radius:0 5px 5px 0;'});
	menuButton.className = "header";
	menuButton.innerHTML = "<h1><img src='"+gctourLogoSmall+"'></h1>";
	
	
	dojo.query("h1",menuButton)[0].id = "gctourButton";
	dojo.query("h1",menuButton).onmouseover(function(e){dojo.byId('gctourContainer').style.display = "block";});
	
	dojo.body().appendChild(menuButton);
	
	
	var thisDiv = createElement('div',{
		style:'background-color: #fff;\
		height: 600px !important;\
		display: none;\
		overflow: hidden;\
		padding: 0 !important;\
		position: fixed !important;\
		top: 30px !important;\
		width: 200px !important;\
		z-index: 100002 !important;\
		border: 1px solid #333333;border-radius:0 5px 5px 0;',
		id:"gctourContainer"});
		
			//~ border-color: #C1CAA8 #C1CAA8 #C1CAA8 -moz-use-text-color;border-style: outset outset outset none;border-width: 1px 1px 1px medium;'});
	dojo.body().appendChild(thisDiv);


	dojo.query(thisDiv).onmouseenter(function(e){ clearTimeout(timeout);});
	dojo.query(thisDiv).onmouseleave(function(e){timeout = setTimeout(function(){dojo.byId('gctourContainer').style.display = "none";}, 1000);});
	
	//~ timeOut = 
	
	
	


	var cacheList = document.createElement('ol');
    cacheList.className = 'cachelist container handles';
	cacheList.setAttribute("dojoType","dojo.dnd.Source");	
	cacheList.setAttribute("jsId","draglist");	

	cacheList.id = 'cacheList';
	cacheList.style.width = '100%';
	cacheList.setAttribute("border","0");




	var div = document.createElement('div');
	div.style.overflow = 'auto';	
	div.style.height = '80%';
	div.style.width = '100%'; 
	div.appendChild(cacheList);
	
    // make it drag n drop - only available after dojo.addOnLoad fired - see init.js
    dojo.parser.parse(div);
    
	dojo.subscribe("/dnd/start", function(){
		dojo.body().style.cursor = 'url("'+closedHand+'"), default';
	});

	dojo.subscribe("/dnd/cancel", function(){
		dojo.body().style.cursor = '';
	});		
		
    // persist the new order after some cache is draged
    dojo.subscribe("/dnd/drop", function(source, nodes, copy, target){
		    dojo.body().style.cursor = '';
            var cachelist = dojo.query('ol[id="cacheList"]')[0];
            
            // iterate over current cachelist in DOM
            var idList = [];        
            for(var i = 0; i < cachelist.childNodes.length;i++){
                idList.push(cachelist.childNodes[i].id); // save every id - in right order
                debug("ids: "+cachelist.childNodes[i].id);
            }
            
            var tempCaches = [];
            for(var i = 0; i < idList.length;i++){ // for each id
                var position = getPositionsOfId(idList[i]); // find the position in the currentTour obj
                tempCaches.push(currentTour.geocaches[position]); // after this add the cache in the temporary array
                
                debug("position: "+position);
                debug("gcid: "+currentTour.geocaches[position].id);
                
                
            }        
            
            // ... and make it persistent
            currentTour.geocaches = tempCaches;	
            
            setTimeout(function() { // hack to prevent "access violation" from Greasemonkey
                saveCurrentTour();
            },0);
    
            // highlight the moved cache
	        dojo.fadeOut({
	        node: nodes[0],duration: 300,
		        onEnd: function(){
			        dojo.fadeIn({
					        node: nodes[0],duration: 300
			        }).play()
		        }
	        }).play();
    });





	var newButton = document.createElement('img');
	newButton.alt = lang['newList'];
	newButton.title = lang['newList'];
	newButton.src = newImageString;
	newButton.style.cursor = 'pointer';
	newButton.style.marginRight = '5px';
	newButton.addEventListener('click', newTourFunction(), false);
	addHoverEffects(newButton);  
	
	var downloadButton = document.createElement('img');
	downloadButton.alt = lang['onlineTour'];
	downloadButton.title = lang['onlineTour'];
	downloadButton.src = downloadImageString;
	downloadButton.style.cursor = 'pointer';
	downloadButton.style.marginRight = '5px';
	downloadButton.addEventListener('click', downloadTourDialog, false);
	//~ downloadButton.addEventListener('click', 
			//~ function(){
				//~ var webcode = window.prompt(lang['webcodePrompt']);
				//~ if(webcode && trim(webcode) != ""){
					//~ downloadTourFunction(webcode);
				//~ } 
			//~ },false);
	addHoverEffects(downloadButton);  


	var toggleSettingsButton = document.createElement('img');
	toggleSettingsButton.alt = lang['showSettings'];
	toggleSettingsButton.title = lang['showSettings'];
	toggleSettingsButton.src = settingsImageString;
	toggleSettingsButton.style.cursor = 'pointer';
	toggleSettingsButton.style.marginRight = '5px';
	toggleSettingsButton.addEventListener('click', openSettingsDialog, false);
	addHoverEffects(toggleSettingsButton);
	

	var toggleTourListButton = document.createElement('img');
	toggleTourListButton.alt = lang['openTour'];
	toggleTourListButton.title = lang['openTour'];
	toggleTourListButton.src = openTourImageString;
	toggleTourListButton.style.cursor = 'pointer';
	toggleTourListButton.style.marginRight = '5px';
	toggleTourListButton.addEventListener('click', openTourDialog, false);
	addHoverEffects(toggleTourListButton);
	
	var sendMessageButton = document.createElement('img');
	sendMessageButton.alt = lang['sendMessageTitle'];
	sendMessageButton.title = lang['sendMessageTitle'];
	sendMessageButton.src = sendMessageImage;
	sendMessageButton.style.cursor = 'pointer';
	sendMessageButton.style.marginRight = '5px';
	sendMessageButton.addEventListener('click', sendMessageDialog, false);
	addHoverEffects(sendMessageButton);

	var autoTourButton = document.createElement('img');
	autoTourButton.alt = lang["autoTour"];
	autoTourButton.title = lang["autoTour"];
	autoTourButton.src = autoTourImage;
	autoTourButton.style.cursor = 'pointer';
	autoTourButton.style.marginRight = '5px';
	autoTourButton.addEventListener('click', showAutoTourDialog, false);
	addHoverEffects(autoTourButton);

	var tourHeaderDiv = document.createElement('div');
	tourHeaderDiv.innerHTML = '<img id="inconsistentTour" src="'+dangerImageString+'" style="float:right;padding:3px;display:none"/><u id="tourName">'+currentTour.name +'</u>&nbsp;<span style="font-size:66%" id="cachecount">('+currentTour.geocaches.length+')';
	tourHeaderDiv.innerHTML+="<span id='webcode'><br>Webcode:<b>"+currentTour.webcode+"</b>&nbsp;</span>"
	// show the webcode if it is available
	if(!currentTour.webcode){
		dojo.query("span[id='webcode']",tourHeaderDiv)[0].style.display = 'none';
	}
	
			append(createElement('br'),tourHeaderDiv)

			var renameButton = document.createElement('img');
			renameButton.src = editImageString;
			renameButton.title = lang['rename'];
			renameButton.alt = lang['rename'];
			renameButton.style.cursor = 'pointer';
			renameButton.style.marginRight = '5px';
			renameButton.addEventListener('click', 
				function(){
				var newTourName = prompt(lang['newTourDialog'], currentTour.name);  
				if(!newTourName) return;
				currentTour.name = newTourName;
				saveCurrentTour();
				updateTour();
				//~ window.location.reload();    				
				},false);
			addOpacityEffects(renameButton);


			var markerButton = document.createElement('img');
			markerButton.src = plusImageString;
			markerButton.alt = lang['addOwnWaypoint'];
			markerButton.title = lang['addOwnWaypoint'];	
			markerButton.style.cursor = 'pointer';
			markerButton.style.marginRight = '3px';
			markerButton.addEventListener('click', function(){showNewMarkerDialog();}, false);
			addOpacityEffects(markerButton);

			var sendGPSButton = document.createElement('img');
			sendGPSButton.alt = lang['sendToGps'];
			sendGPSButton.title = lang['sendToGps'];
			sendGPSButton.src = sensGPSImageString;
			sendGPSButton.style.cursor = 'pointer';
			sendGPSButton.style.marginRight = '5px';
			//sendGPSButton.addEventListener('click', openSend2GpsFunctionLocal(), false);
			sendGPSButton.addEventListener('click', openSend2GpsDialog, false);
			addOpacityEffects(sendGPSButton);
			
			var makeMapButton = document.createElement('img');
			makeMapButton.alt = lang['makeMap'];
			makeMapButton.title = lang['makeMap'];
			makeMapButton.src = mapImageString;
			makeMapButton.style.cursor = 'pointer';
			makeMapButton.style.marginRight = '5px';
			//sendGPSButton.addEventListener('click', openSend2GpsFunctionLocal(), false);
			makeMapButton.addEventListener('click', makeMapFunction, false);
			addOpacityEffects(makeMapButton);

			var uploadTourButton = document.createElement('img');
			uploadTourButton.alt = lang['upload'];
			uploadTourButton.title = lang['upload'];
			uploadTourButton.src = uploadImageString;
			uploadTourButton.style.cursor = 'pointer';
			uploadTourButton.style.marginRight = '5px';
			uploadTourButton.addEventListener('click', function(){uploadTourFunction(currentTour.id)();}, false);
			addOpacityEffects(uploadTourButton);

			var requestPrintButton = document.createElement('img');
			requestPrintButton.alt = lang['printview'];
			requestPrintButton.title = lang['printview'];
			requestPrintButton.src = printerImageString;
			requestPrintButton.style.cursor = 'pointer';
			requestPrintButton.style.marginRight = '5px';
			requestPrintButton.addEventListener('click', function(){printPageFunction(currentTour)();}, false);
			addOpacityEffects(requestPrintButton);

			var downloadGPXButton= document.createElement('img');
			downloadGPXButton.alt = lang['downloadGpx'];
			downloadGPXButton.title = lang['downloadGpx'];
			downloadGPXButton.src = downloadGPXImageString;
			downloadGPXButton.style.cursor = 'pointer';
			downloadGPXButton.style.marginRight = '5px';
			downloadGPXButton.addEventListener('click',downloadGPXFunction(), false);
			addOpacityEffects(downloadGPXButton);	
	
			append(renameButton,tourHeaderDiv);
			append(requestPrintButton,tourHeaderDiv);
			append(sendGPSButton,tourHeaderDiv);
			append(downloadGPXButton,tourHeaderDiv);
			append(makeMapButton,tourHeaderDiv);
			append(uploadTourButton,tourHeaderDiv);
			append(markerButton,tourHeaderDiv);

			// remove the ads under the menu - to be sure the gctour is visible ;-)
			var adDiv = getElementsByAttribute('class','BanManWidget')[0];
			if(adDiv)
				dojo.destroy(adDiv);


			var buttonsDiv = document.createElement('div');

			buttonsDiv.appendChild(newButton);
			buttonsDiv.appendChild(toggleTourListButton);
			buttonsDiv.appendChild(downloadButton);
			buttonsDiv.appendChild(autoTourButton);
			buttonsDiv.appendChild(toggleSettingsButton);
			buttonsDiv.appendChild(sendMessageButton);


			var header = document.createElement('div');
			header.className= "header";
			header.style.cursor = "pointer";
			
			header.innerHTML = "<h1><img src='"+gctourLogoImage+"'/></h1";
			
			//~ header.style.backgroundImage = "url("+gctourLogoImage+")";
			//~ header.style.backgroundPosition = "center left";
			//~ header.style.backgroundRepeat = "no-repeat";
			//~ header.style.cursor = "pointer";
			//~ header.style.height = "30px";
						
			dojo.query("h1",header).onmouseover(function(e){this.style.backgroundColor = "orange"}).onmouseout(function(e){this.style.backgroundColor = "#B2D4F3"}).onclick(function(e){window.open('http://gctour.madd.in');});
			
			var footerDiv = createElement('div',{style:"font-size: 70%;"});
			footerDiv.innerHTML = "<p style='text-align:right'>v"+ version + "." + build + "</p>";
			
			
			


	
			append(header, thisDiv);
			append(buttonsDiv, thisDiv);			
			append(tourHeaderDiv, thisDiv);
			append(div, thisDiv);
			append(footerDiv, thisDiv);
	
	




			// popultate the current list on load
			for (var i = 0; i < currentTour.geocaches.length; i++){
				addNewTableCell(currentTour.geocaches[i],false);
			}

			if(currentTour.geocaches.length == 0){
				var table = document.getElementById('cacheList');		
				table.innerHTML = lang['emptyList'];
			}
}
