function startAutoTour(){
	var typeInputs = dojo.query("input[name='type']");
	var sizeInputs = dojo.query("input[name='size']");
	var difficultyInputs = dojo.query("input[name='Difficulty']");
	var terrainInputs = dojo.query("input[name='Terrain']");
	var specialInputs = dojo.query("input[name='special']");

	var typeFilter = new Object();
	for(var i = 0; i<typeInputs.length;i++){
		typeFilter[typeInputs[i].value] = typeInputs[i].checked;
	}

	var sizeFilter = new Object();
	for(var i = 0; i<sizeInputs.length;i++){
		sizeFilter[sizeInputs[i].value] = sizeInputs[i].checked;
	}

	var difficultyFilter = new Object();
	for(var i = 0; i<difficultyInputs.length;i++){
		difficultyFilter[difficultyInputs[i].value] = difficultyInputs[i].checked;
	}

	var terrainFilter = new Object();
	for(var i = 0; i<terrainInputs.length;i++){
		terrainFilter[terrainInputs[i].value+""] = terrainInputs[i].checked;
	}
	var specialFilter = new Object();
	for(var i = 0; i<specialInputs.length;i++){
		//~ GM_log(">"+specialInputs[i].value+"<");
		specialFilter[specialInputs[i].value+""] = specialInputs[i].checked;
	}

	var lat = dojo.query("input[id='coordsDivLat']")[0].value;
	var lon = dojo.query("input[id='coordsDivLon']")[0].value;
	var radius = dojo.query("input[id='coordsDivRadius']")[0].value;
	var url = "http://www.geocaching.com/seek/nearest.aspx?lat="+lat+"&lon="+lon+"&dist="+radius;

	if(specialFilter["I haven't found "]){
		url += "&f=1";
	}


	GM_setValue('tq_url', url);
	GM_setValue('tq_typeFilter', uneval(typeFilter));
	GM_setValue('tq_sizeFilter', uneval(sizeFilter));
	GM_setValue('tq_dFilter', uneval(difficultyFilter));
	GM_setValue('tq_tFilter', uneval(terrainFilter));
	GM_setValue('tq_specialFilter', uneval(specialFilter));
	GM_setValue('tq_StartUrl', document.location.href);

	document.location.href = url;

}

function getMarkerCoord(latitude,longitude){
	return function(){

		if(latitude && longitude){
			updateAutoTourMap(latitude,longitude);
			return;
		}


		var markerCoords = dojo.query("input[id='markerCoords']")[0].value;
		var regex = new RegExp(/(N|S)(\s*)(\d{0,2})(\s*)�(\s*)(\d{0,2}[\.,]\d+)(\s*)(E|W)(\s*)(\d{0,3})(\s*)�(\s*)(\d{0,2}[\.,]\d+)/);
		var regex2 = new RegExp(/(-{0,1}\d{0,2}[\.,]\d+)(\s*)(-{0,1}\d{0,3}[\.,]\d+)/);
		var lat,lon;
		if(markerCoords.match(regex)){

			var ergebnis = regex.exec(markerCoords);

			lat = DM2Dec(ergebnis[3],ergebnis[6]);
			if(ergebnis[1] == 'S') lat = lat * (-1);

			lon = DM2Dec(ergebnis[10],ergebnis[13]);
			if(ergebnis[8] == 'W') lon = lon * (-1);


		} else if(markerCoords.match(regex2)){
			lat = parseFloat(RegExp.$1+""+RegExp.$2);
			lon = parseFloat(RegExp.$3+""+RegExp.$4);
		} else {
			log("Google req://maps.google.com/maps/geo?q="+markerCoords+"&output=json&oe=utf8&sensor=true_or_false&key=ABQIAAAAKUykc2Tomn0DYkEZVrVaaRSNBTQkd3ybMgPO53QyT8hP9fzjBxSrEmDQGeGO-AZdQ4ogAvc8mRcV-g");
			GM_xmlhttpRequest({
				method: 'GET',
				url: "http://maps.google.com/maps/geo?q="+markerCoords+"&output=json&oe=utf8&sensor=false&key=ABQIAAAAKUykc2Tomn0DYkEZVrVaaRSNBTQkd3ybMgPO53QyT8hP9fzjBxSrEmDQGeGO-AZdQ4ogAvc8mRcV-g",
				onload: function(responseDetails) {
						if(typeof JSON === "undefined"){
							var jsonResponse = eval("("+responseDetails.responseText+")");
						} else {
							var jsonResponse = JSON.parse(responseDetails.responseText);
						}
						if(jsonResponse.Placemark){
							var lat = parseFloat(jsonResponse.Placemark[0].Point.coordinates[1]);
							var lon = parseFloat(jsonResponse.Placemark[0].Point.coordinates[0]);
							getMarkerCoord(lat,lon)();
						}
					}
			});
			return;
		}
		updateAutoTourMap(lat, lon);
	}
}


function saveMarkerCoord(cordsInput,cordsInputLat,cordsInputLon){
	return function(){
		//~ var cordsInput = $('#markerCoords');//document.getElementById('markerCoords');

		var regex = new RegExp(/(N|S)(\s*)(\d{0,2})(\s*)�(\s*)(\d{0,2}[\.,]\d+)(\s*)(E|W)(\s*)(\d{0,3})(\s*)�(\s*)(\d{0,2}[\.,]\d+)/);
		var regex2 = new RegExp(/(-{0,1}\d{0,2}[\.,]\d+)(\s*)(-{0,1}\d{0,3}[\.,]\d+)/);
		window.setTimeout(
				function(){
				var result = regex.exec(cordsInput.value);
				var result2 = regex2.exec(cordsInput.value);

				log(result +" " +result2);
				if (!result && !result2) {
				cordsInput.style.backgroundColor = "#FF8888";

				//~ document.getElementById('staticGMap').style.display = 'none';
				} else if (result) {
				cordsInput.style.backgroundColor = "#88DC3B";

				var lat = DM2Dec(result[3],result[6]);
				if(result[1] == 'S') lat = lat * (-1);
				cordsInputLat.value = lat;

				var lon = DM2Dec(result[10],result[13]);
				if(result[8] == 'W') lon = lon * (-1);
				cordsInputLon.value = lon;
				document.getElementById('staticGMap').style.display = 'block';
				updateMarkerOverviewMap(cordsInputLat.value ,cordsInputLon.value,13);
				}else if (result2) {
					cordsInput.style.backgroundColor = "#88DC3B";
					var lat = parseFloat(result2[1]+""+result2[2]);
					var lon = parseFloat(result2[3]+""+result2[4]);

					cordsInputLat.value = lat;
					cordsInputLon.value = lon;
					document.getElementById('staticGMap').style.display = 'block';
					updateMarkerOverviewMap(cordsInputLat.value ,cordsInputLon.value,13);
				}

				},10);
	}
}

function getSpecialFilter(){
	var specialDiv = document.createElement('div');
	specialDiv.style.cssFloat = "left";	
	specialDiv.style.paddingRight = "10px";
	specialDiv.style.textAlign = "left";
	specialDiv.innerHTML = "<b>That</b><br/>";


	var specials = ['I haven\'t found ','is Active', 'is not a PM cache'];
	//~ var specials = ['I haven\'t found ','is Active', 'i don\'t own'];

	for(var i = 0; i<specials.length; i++ ){
		var checkboxSpan = createElement('span');

		var checkbox = createElement('input', {type: 'checkbox', name: "special", value: specials[i], checked: 'checked'});
		checkbox.style.margin = '0px';

		var caption = createElement('span');
		caption.innerHTML = specials[i];

		append(checkbox, checkboxSpan);
		append(caption, checkboxSpan);
		append(checkboxSpan, specialDiv);
		append(createElement('br'), specialDiv);

	}

	return specialDiv;

}

function getDtFiler(boxName){

	var checkboxesDiv = document.createElement('div');

	checkboxesDiv.style.cssFloat = "left";	
	checkboxesDiv.style.textAlign = "left";
	checkboxesDiv.style.paddingRight = "10px";
	checkboxesDiv.innerHTML = "<b>"+boxName+"</b><br/>";
	for(var i = 1; i<=5; i = i+0.5){
		var checkboxDiv = createElement('span');

		checkboxDiv.style.border = '1px solid gray';
		checkboxDiv.style.margin = '2px';
		checkboxDiv.style.verticalAlign = 'middle';

		var checkbox = createElement('input', {type: 'checkbox', name: boxName, value: i, id:boxName+""+i, checked: 'checked'});
		checkbox.style.margin = '0px';

		var label = createElement('label');
		label.setAttribute("for", boxName+""+i);
		var caption = createElement('img');
		append(caption,label);
		var value = ""+i;
		value = value.replace(/\./g, "_");
		caption.src = "http://www.geocaching.com/images/stars/stars"+value+".gif";




		checkboxesDiv.appendChild(checkbox);
		checkboxesDiv.appendChild(label);
		checkboxesDiv.appendChild(createElement('br'));
	}

	return checkboxesDiv;
}


function getSizeFilter(){

	//~ http://www.geocaching.com/images/icons/container/micro.gif
	//~ http://www.geocaching.com/images/icons/container/small.gif
	//~ http://www.geocaching.com/images/icons/container/regular.gif
	//~ http://www.geocaching.com/images/icons/container/large.gif
	//~ http://www.geocaching.com/images/icons/container/other.gif
	//~ http://www.geocaching.com/images/icons/container/virtual.gif
	//~ http://www.geocaching.com/images/icons/container/not_chosen.gif

	var sizes = ['micro','small','regular','large','other','virtual','not_chosen'];

	var sizesCheckboxesDiv = document.createElement('div');

	sizesCheckboxesDiv.style.cssFloat = "left";	
	sizesCheckboxesDiv.style.textAlign = "left";
	sizesCheckboxesDiv.style.paddingRight = "10px";
	sizesCheckboxesDiv.innerHTML = "<b>Size</b><br/>";
	for(var i = 0; i<sizes.length; i++ ){
		var checkboxDiv = createElement('span');

		checkboxDiv.style.border = '1px solid gray';
		checkboxDiv.style.margin = '2px';
		checkboxDiv.style.verticalAlign = 'middle';

		var checkbox = createElement('input', {type: 'checkbox', name: "size", value: sizes[i], id:"size"+sizes[i], checked: 'checked'});
		checkbox.style.margin = '0px';
		var label = createElement('label');
		label.setAttribute("for", "size"+sizes[i]);
		
		var caption = createElement('img');
		append(caption,label);
		caption.src = "http://www.geocaching.com/images/icons/container/"+sizes[i]+".gif";
		caption.title = sizes[i];
		caption.alt = sizes[i];

		sizesCheckboxesDiv.appendChild(checkbox);
		sizesCheckboxesDiv.appendChild(label);
		sizesCheckboxesDiv.appendChild(createElement('br'));
	}

	return sizesCheckboxesDiv;

	//~ 
	//~ http://www.geocaching.com/images/icons/container/micro.gif
}

function getTypeFilter(){


	var typeDiv = document.createElement('div');
	typeDiv.style.textAlign = "left";
	typeDiv.style.paddingLeft = "10px";
	typeDiv.style.paddingRight = "10px";
	typeDiv.style.textAlign = "left";
	typeDiv.style.cssFloat = "left";
	typeDiv.innerHTML = "<b>Type</b><br/>";

	for(var i = 0; i< wptArray.length;i++){	
		var checkboxDiv = createElement('span');

		var checkbox = createElement('input', {type: 'checkbox', name: "type", value: wptArray[i]['wptTypeId'], id: "type"+wptArray[i]['wptTypeId'], checked: 'checked'});
		append(checkbox,checkboxDiv);
		checkbox.style.margin = '0px';

		var label = createElement('label');
		label.setAttribute("for", "type"+wptArray[i]['wptTypeId']);
		
		append(label,checkboxDiv);
		var caption = createElement('img');
		append(caption,label);
		caption.src = 'http://www.geocaching.com/images/WptTypes/sm/'+wptArray[i]['wptTypeId']+'.gif';

		append(checkboxDiv,typeDiv);

		if((i+1) % 2 == 0){
			typeDiv.appendChild(createElement('br'));
			checkboxDiv.style.paddingLeft = '10px';
		}
	}



	return typeDiv;
}


function getCoordinatesTab(){
	var coordsDiv = createElement('div');
	coordsDiv.id = 'coordsDiv';
	coordsDiv.align = "left";

	var divEbene = createElement('div', {className: 'ebene'});
	var spanLabel = createElement('span', {className: 'label'});append(spanLabel, divEbene);
	var spanFeld = createElement('span', {});append(spanFeld, divEbene);
	spanLabel.innerHTML = lang["autoTourCenter"];
	var cordsInput = createElement('input', {type: 'text', id: "markerCoords"});
	append(cordsInput,spanFeld);
	append(getLocateMeButton(),spanFeld);
	var coordsExample = createElement('span',{style: "font-size:66%"});append(coordsExample,spanFeld);
	coordsExample.innerHTML = "<br/><i>N51� 12.123 E010� 23.123</i> or <i>40.597 -75.542</i> or <i>Berlin</i> ";
	append(divEbene, coordsDiv);

	divEbene = createElement('div', {className: 'ebene'});
	spanLabel = createElement('span', {className: 'label'});append(spanLabel, divEbene);
	spanFeld = createElement('span', {});append(spanFeld, divEbene);
	spanLabel.innerHTML = lang["autoTourRadius"];
	var cordsRadiusInput = createElement('input', {type: 'text', id: "markerRadius", maxlength: "4", style:"width:50px;margin-right:5px"});append(cordsRadiusInput,spanFeld);
	var coordsSelect = createElement('select', {id: "markerRadiusUnit"});append(coordsSelect, spanFeld);
	var coordsSelectElement = createElement("option", {selected:"selected", value: "km"});append(coordsSelectElement, coordsSelect);
	coordsSelectElement.innerHTML = lang["kilometer"];
	coordsSelectElement = createElement("option", {value: "sm"});append(coordsSelectElement, coordsSelect);
	coordsSelectElement.innerHTML = lang["mile"];
	append(divEbene, coordsDiv);



	divEbene = createElement('div', {className: 'submit'});
	var useButton = createElement('button');append(useButton,divEbene);
	useButton.innerHTML = lang["autoTourRefresh"];
	useButton.addEventListener('click',getMarkerCoord() ,false);
	append(divEbene, coordsDiv);

	return coordsDiv;
}

function getMapPreviewTab(){
	var coordsDiv = createElement('div');
	coordsDiv.id = 'coordsDiv';
	coordsDiv.align = "left";

	var cordsInputLat = createElement('input', {type: 'hidden', id: "coordsDivLat"});
	coordsDiv.appendChild(cordsInputLat);

	var cordsInputLon = createElement('input', {type: 'hidden', id: "coordsDivLon"});
	coordsDiv.appendChild(cordsInputLon);

	var cordsInputRadius = createElement('input', {type: 'hidden', id: "coordsDivRadius"});
	coordsDiv.appendChild(cordsInputRadius);

	var coordsLabel = createElement('div');append(coordsLabel, coordsDiv);
	coordsLabel.innerHTML = lang["markerCoordinate"]+": <b id='markerCoordsPreview'>???</b>&nbsp;&nbsp;&nbsp;"+lang["autoTourRadius"]+": <b id='markerRadiusPreview'>???km</b>"

		// previewMap	
		var staticGMap = createElement('div');
	staticGMap.id = 'staticGMap';

	staticGMap.style.border = '2px solid gray';
	staticGMap.style.backgroundImage = "url("+previewImage+")";
	staticGMap.style.backgroundPosition = "center";
	staticGMap.style.backgroundRepeat = "no-repeat";

	staticGMap.style.height = '200px';
	staticGMap.style.width = '400px';
	//~ staticGMap.style.marginBottom = '10px';
	staticGMap.style.backgroundRepeat = 'no-repeat';

	coordsDiv.appendChild(staticGMap);

	var cacheCountLabel = createElement('div');append(cacheCountLabel, coordsDiv);
	cacheCountLabel.innerHTML = lang["autoTourCacheCounts"]+"<b id='markerCountPreview'>???</b>"
		var tourDurationLabel = createElement('div');append(tourDurationLabel, coordsDiv);
	tourDurationLabel.innerHTML = lang['autoTourDuration']+"<b id='markerDurationMin'>???</b>min<b id='markerDurationSec'>???</b>sec"

		return coordsDiv;
}

function getLocateMeButton(){
	var button = createElement('button',{style:"margin-left:10px"});
	button.innerHTML = "<img id='locateImage' src='"+locateMeImage+"'><span style='vertical-align:top;margin-left:3px;color:#F6A828;font-weight:bold'>Locate Me</span>";

	button.addEventListener('click',
			function(){

			if(navigator.geolocation){
			dojo.byId('locateImage').src = "http://madd.in/ajax-loader3.gif";
			navigator.geolocation.getCurrentPosition(
				function(position){
				dojo.byId('locateImage').src = locateMeImage;
				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;

				dojo.query("input[id='markerCoords']")[0].value = latitude +' '+longitude;
				dojo.query("input[id='markerRadius']")[0].value = 1;
				getMarkerCoord()();
				},

				function(error){
				dojo.byId('locateImage').src = locateMeImage;
				log('Unable to get current location: ' + error);
				}, {timeout:10000});
			} else {
				alert("Firefox 3.5? Please update to use this!");
			}


			},false);



	return button;
}

function getAutoTourSubmit(){
	var queryFilterDiv = document.createElement('div');
	var getCachesButton = createElement('button');append(getCachesButton, queryFilterDiv);
	getCachesButton.id="startQuery";
	getCachesButton.innerHTML = "<img src ='"+startAutoTourImage+"'>";
	getCachesButton.style.marginTop = "15px";
	getCachesButton.style.opacity = "0.4";
	getCachesButton.disabled = "disabled";

	getCachesButton.addEventListener('click',
			startAutoTour,false);


	return queryFilterDiv;

}

function CalcPrjWP(lat,lon, dist, angle)
{  
	//~ B1 = parseFloat(NorthGrad.replace(/,/, ".")) + parseFloat(NorthMin.replace(/,/, ".")) / 60;
	//~ L1 = parseFloat(EastGrad.replace(/,/, ".")) + parseFloat(EastMin.replace(/,/, ".")) / 60;
	//~ Dist = parseFloat(Distance.replace(/,/, "."));
	//~ Angle = parseFloat(DirAngle.replace(/,/, "."));
	var B1 = parseFloat(lat);
	var L1 = parseFloat(lon);
	var Dist = parseFloat(dist);
	var Angle = parseFloat(angle);

	while (Angle > 360) {
		Angle = Angle - 360;
	}
	while (Angle < 0) {
		Angle = Angle + 360;
	}

	//var c = Dist / 6371.0; // KM
	var c = Dist /  3958.75587; // miles
	if (B1 >= 0) {
		var a = (90 - B1) * Math.PI / 180
	} else {
		var a = B1 * Math.PI / 180;
	}
	var q = (360 - Angle) * Math.PI / 180;
	var b = Math.acos(Math.cos(q) * Math.sin(a) * Math.sin(c) + Math.cos(a) * Math.cos(c));
	var  B2 = 90 - (b * 180 / Math.PI);
	if (B2 > 90) {
		B2 = B2 - 180; //Suedhalbkugel
	}
	if ((a + b) == 0) {
		var g = 0; //Nenner unendlich
	} else {
		var g = Math.acos( (Math.cos(c) - Math.cos(a) * Math.cos(b)) / (Math.sin(a) * Math.sin(b)) );
	}
	if (Angle <= 180) {
		var g = (-1) * g;
	}
	var L2 = (L1 - g * 180 / Math.PI);

	return [Math.round(B2 * 100000) / 100000,Math.round(L2 * 100000) / 100000];
}

function updateAutoTourMap(lat,lon){

	//~ var meterMiles = dojo.query("select[id='markerRadiusUnit'] > option[selected='selected']")[0].value;


	var radiusOrg = dojo.query("input[id='markerRadius']")[0].value;
	if(isNaN(radiusOrg) || radiusOrg == "")// please break if radius is no number
		return;


	var meterMiles = dojo.query("select[id='markerRadiusUnit']")[0].selectedIndex;
	// meter: meterMiles == 0		miles: meterMiles == 1
	var radiusMiles = (meterMiles==1)?parseFloat(radiusOrg):parseFloat(radiusOrg)*0.621371;

	if(radiusMiles == "")
		return;

	var apiKey = "ABQIAAAAKUykc2Tomn0DYkEZVrVaaRSNBTQkd3ybMgPO53QyT8hP9fzjBxSrEmDQGeGO-AZdQ4ogAvc8mRcV-g";

	var path = "path=fillcolor:0xF6A8287F|color:0xF6A828FF|"
		for(var i = 1; i<=361;i = i+15){


			var waypoint = CalcPrjWP(lat,lon,radiusMiles,i);
			debug("WPT PRJ lat:"+lat+" lon:"+lon+" radius:"+radiusMiles+"Miles i:"+i);
			debug("WPT PRJ "+waypoint[0]+","+waypoint[1]);
			debug("");

			path += waypoint[0]+","+waypoint[1];

			if(i != 361)
				path += "|";

		}
	var staticGMap = dojo.query('div[id="staticGMap"]')[0];
	staticGMap.style.backgroundImage = 'url(http://maps.google.com/maps/api/staticmap?'+path+'&size=400x200&sensor=false&key='+apiKey+')';

	var latArray = Dec2DM(lat);
	var lonArray = Dec2DM(lon);

	var latOrigin = (latArray[0]<0)?"S":"N";
	var lonOrigin = (lonArray[0]<0)?"W":"E";

	latArray[0] = (latArray[0]<0)?latArray[0]*(-1):latArray[0];
	lonArray[0] = (lonArray[0]<0)?lonArray[0]*(-1):lonArray[0];


	dojo.query('b[id="markerCoordsPreview"]')[0].innerHTML = latOrigin+""+latArray[0]+"� "+latArray[1]+" ";
	dojo.query('b[id="markerCoordsPreview"]')[0].innerHTML += lonOrigin+""+lonArray[0]+"� "+lonArray[1];
	dojo.query('b[id="markerRadiusPreview"]')[0].innerHTML = radiusOrg+""+((meterMiles==1)?"mi":"km");

	dojo.animateProperty(
					{
	node: "markerCoordsPreview",duration: 1000,
	properties: {
	//~ color:         { start: "black", end: "white" },
	backgroundColor:   { start: "#FFE000", end: "#EEEEEE" }
	}
	}).play();
	dojo.animateProperty(
			{
	node: "markerRadiusPreview",duration: 1000,
	properties: {
	//~ color:         { start: "black", end: "white" },
	backgroundColor:   { start: "#FFE000", end: "#EEEEEE" }
	}
	}).play();

	// get how many caches are in this area

	loadingTime1 = new Date();


	log("url: http://www.geocaching.com/seek/nearest.aspx?lat="+lat+"&lng="+lon+"&dist="+radiusMiles);
		GM_xmlhttpRequest({
		method: 'GET',
		url: "http://www.geocaching.com/seek/nearest.aspx?lat="+lat+"&lng="+lon+"&dist="+radiusMiles,
		onload: function(responseDetails) {
			var dummyDiv = createElement('div');
			dummyDiv.innerHTML = responseDetails.responseText;

			//~ var pagesSpan = dojo.query("div[class='widget-pagebuilder']> table > tbody > tr > td > span",dummyDiv)[0];
			//~ <td class="PageBuilderWidget"><span>Total Records: <b>
			
			var pagesSpan = dojo.query("td[class='PageBuilderWidget']",dummyDiv)[0];
			
			if(pagesSpan){
				dojo.query("b[id='markerCountPreview']")[0].innerHTML = pagesSpan.getElementsByTagName('b')[0].innerHTML;

				dojo.animateProperty({
					node: "markerCountPreview",duration: 1000,
					properties: {backgroundColor:   { start: "#FFE000", end: "#EEEEEE" }}
				}).play();


				var miliseconds = new Date() - loadingTime1;
				var seconds = Math.floor((miliseconds * parseFloat(pagesSpan.getElementsByTagName('b')[2].innerHTML) )/1000);
				seconds = seconds + parseFloat(pagesSpan.getElementsByTagName('b')[2].innerHTML) * 2;
				var secondsMod = seconds % 60;
				var minutes = (seconds - secondsMod) /60;

				dojo.query("b[id='markerDurationMin']")[0].innerHTML = minutes;
				dojo.query("b[id='markerDurationSec']")[0].innerHTML = secondsMod;
			} else {
				dojo.query("b[id='markerCountPreview']")[0].innerHTML = 0;

				dojo.animateProperty({
					node: "markerCountPreview",duration: 2000,
					properties: {backgroundColor:{ start: "#FF0005", end: "#EEEEEE" }}
				}).play();


				dojo.query("b[id='markerDurationMin']")[0].innerHTML = 0;
				dojo.query("b[id='markerDurationSec']")[0].innerHTML = 0;
			}
		}
	});



	// last, save the values
	dojo.query('input[id="coordsDivLat"]')[0].value = lat;
	dojo.query('input[id="coordsDivLon"]')[0].value = lon;
	dojo.query('input[id="coordsDivRadius"]')[0].value = radiusMiles;
	dojo.query('b[id="markerCountPreview"]')[0].innerHTML = "<img src='http://madd.in/ajax-loader3.gif'>";
	dojo.query("b[id='markerDurationMin']")[0].innerHTML = "<img src='http://madd.in/ajax-loader3.gif'>";
	dojo.query("b[id='markerDurationSec']")[0].innerHTML = "<img src='http://madd.in/ajax-loader3.gif'>";



	// enable the startQuery button
	var startQuery = dojo.query('button[id="startQuery"]')[0];
	startQuery.removeAttribute('disabled');
	startQuery.style.opacity = "1";
}