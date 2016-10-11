/** The OsmController-Class works as a coordinator between OsmView and the Overpass-API 
 * to get OSM features from the OSM Database.
 * 
 * @param OsmView The OsmView to be set.
 */
function OsmController(OsmView) {
	/** the osm-view to be used.*/
	this.OsmView = OsmView;
	
}
/** The OsmController prototype */
OsmController.prototype = {
		
		/** Checks if a given string is an empty string and returns a Boolean according to the result
		 * (true, if not empty; false, if empty.) 
		 * 
		 * @param value The string to be checked.
		 * @returns {Boolean} The result of the check.
		 */
        emptyCheck: function(value) {
			return value != "";
		},
        
		/** Checks if a given string ends with a point. If the string doesn't end with a point, the string is returned.
		 * 
		 * @param value The string to be checked.
		 * @returns The checked string.
		 */
		pointCheck: function(value) {
			if (!value.endsWith('.')) {
				return value;
			} 			
		},
		
		/** Prepares parts of the string for the Overpass-API request according to the content of the given adress data.
		 * 
		 * @param adresses An array with the original adress data (streetname and eventually housenumber) of the 
		 * dataset to be used for the request.
		 * @param streets An array with all streetnames of the dataset to be used for the request.
		 * @param lines
		 * @param numbering
		 * @returns {Boolean}
		 */
		prepareQuery: function(adresses, streets, lines, numbering) {
			var concrete = true;
			for (var element in adresses) {  				
				adresses[element] = adresses[element].replace(/\([^\)]*\)/g, '');
  	  			var regStreetName = /[a-zA-ZäÄöÖüÜßéÉ\-]{2,}|([0-9]{1,}(\.){1,}){0,}/g;  		
  	  			var streetName = adresses[element].match(regStreetName);
  	  			var lineName = '"name"';;
  	  			var addrStreet = '"addr:street"';
  	  			if (streetName != null) {			
  	  				streetName = streetName.filter(this.emptyCheck); 
  	  				console.log(streetName);
  	  				addrStreet += '="' + streetName.join(' ').trim() + '"';  				
  	  				lineName += '="' + streetName.join(' ').trim() + '"';  
  	  			} else {
  	  				addrStreet += '~"."'; 
  	  				lineName += '~"."';
  	  			}
  	  			streets.push(addrStreet);
  	  			lines.push(lineName);
  	  			var regHouseNumber = /(([0-9\.]{1,}(\.){1,}){0,}|[0-9]{1,}[a-zA-Z]{0,1}){1,}/g;
  	  			var houseNumber = adresses[element].match(regHouseNumber);
  	  			var addrHousenumber = '"addr:housenumber"';
  	  			houseNumber = houseNumber.filter(this.emptyCheck);
  	  			houseNumber = houseNumber.filter(this.pointCheck);
  	  			if (houseNumber.length > 0) {			
  	  				console.log(houseNumber);
  	  				if (houseNumber.length > 1) {
  	  					addrHousenumber += '~"';
  	  					addrHousenumber += houseNumber.join('|');
  	  					addrHousenumber += '"';
  	  				} else {
  	  					addrHousenumber += '="' + houseNumber[0] + '"';
  	  				} 
  	  			} else {
  	  				addrHousenumber += '~"."';
  	  				if (element === "0") {
  	  					concrete = false;
  	  					//console.log('element = ' + element)
  	  				}
  	  			}
  	  			numbering.push(addrHousenumber);	  			
  	  		}
			return concrete;
		},
		
		/** Builds a Overpass-API query based on the given contentByIndex and returns the constructed string.
		 * 
		 * @param index The index of the dataset to work with.
		 * @param contentByIndex The content of the datasaet to work with.
		 * @returns {String} The constructed Overpass-API string.
		 */
		buildQuery: function(index, contentByIndex) {
			console.log(index);
			console.log(contentByIndex);
			var content = contentByIndex;
			var country = content["country"];
  	  		var state = content["state"];
  	  		var city = content["municipality"].replace(/\([^\)]*\)/g, '');
  	  		var area = content["area"].replace(/\([^\)]*\)/g, ''); 	
  	  		var adrArray = content["adress"].split(", ");
  	  		var streets = new Array();
  	  		var lines = new Array();
  	  		var numbering = new Array();
  	  		var concrete = this.prepareQuery(adrArray, streets, lines, numbering);  	  		
  	  		var query = '(area["admin_level"="4"]["ISO3166-2"~"^' + country + '"]["name"="' + state + '"]->.country;rel(area.country)["boundary"="administrative"]["name"~"^' + city + '"];'
  	  		if (area !== city && area !== state) {
  	  			query += 'map_to_area -> .city;rel(area.city)["boundary"="administrative"]["name"="' + area + '"];map_to_area -> .suburb;(';
  	  		} else {
  	  			query += 'map_to_area -> .suburb;(';
  	  		}
	  		var unconcreteAdress = "";
	  		var concreteAdress = "";
	  		for (var element in streets) {
	  	  	 	unconcreteAdress += 'way(area.suburb)[' + lines[element] + '];way(area.suburb)[' + streets[element] + '];';
	  	  		concreteAdress += 'way(area.suburb)['+ streets[element] + '][' + numbering[element] + '];node(area.suburb)['+ streets[element] + '][' + numbering[element] + '];way(area.suburb)[' + lines[element] + '];';
	  		}
	  	  	var searchAround = ') ->.house;(way(around.house:35)["name"];way(around.house:35)["building"];node(around.house:50););'; 		  	
	  	  	if (concrete === false) {
		  		query += unconcreteAdress;
		  	} else {
		  		query += concreteAdress;
		  	}
		  	query += searchAround + '(._;>;););out qt;'; 
		  	console.log(query)
		  	return query;
		},
		
		/** Calls the Overpass-API with the given dataContent and delegates the corresponding 
		 * response to the given callback function. 
		 * 
		 * @param index The index of the dataset used for the request.
		 * @param callback The function to be called after the response from the Overpass-API.
		 * @param dataContent The data content to be used for the request.
		 */
		osmRequest: function(index, callback, dataContent) {
			var data = dataContent;
			this.OsmView.setOsmSearch();	  
			$.ajax({
				type: 'POST',
				context: this,
				//url: 'http://api.openstreetmap.fr/oapi/interpreter/',
				url: 'https://overpass-api.de/api/interpreter',
				data: {'data':data},
				success: function(response){	
					$.getScript("./resources/js/main/external/osmtogeojson.js", function() {
						var geoJson = osmtogeojson(response);	
						callback(geoJson);
					});			
				},
				error: function(xhr) {
					callback(xhr.status);
			    }
			});
		},
		
		/** Calls the osm-view to be initialized. 
		 */
		setOsmView: function(){
			this.OsmView.init();
		},
		
		/** Calls the osm-view to inform about a failed osm-response.
		 * 
		 * @param reponse The error response to be set.
		 */
		setErrorResponse: function(reponse) {
			this.OsmView.setOsmErrorResponse(response);
		},
		
		/** Calls the osm-view to inform about a successful osm-response.
		 * 
		 * @param responseLength The amount of found features.
		 */
		setSuccessResponse: function(responseLength) {
			this.OsmView.setOsmSuccessResponse(responseLength);
		}
};