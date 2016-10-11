/** The MapController works as a coordinator between MapModel and MapView and. It initializes the 
 * the map interactions and processes the features. During that process it also passes OSM relevant infos
 * to the OsmController.
 * 
 * @param MapView The MapView to be set.
 * @param HeaderView The HeaderView to be set.
 * @param MapModel The MapModel to be set.
 * @param OsmController The OsmController to be set.
 */
function MapController(MapView, HeaderView, MapModel, OsmController) {	
	/** The MapView to be used.*/
	this.MapView = MapView;
	/** The HeaderView to be used.*/
	this.HeaderView = HeaderView;
	/** The OsmController to be used.*/
	this.OsmController = OsmController;
	
	/** The definition and activation of the coordinate reference system 'EPSG:25833'.*/
	var EPSG25833 = 'EPSG:25833';
	proj4.defs(EPSG25833, "+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs");
	/** The definition and activation of the coordinate reference system 'EPSG:25832'.*/
	var EPSG25832 = 'EPSG:25832';
	proj4.defs(EPSG25832, "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");	
	
	/** The MapModel to be used.*/
	this.map = MapModel.map;
	
	/** The source vector to handle the monument features.*/
	this.monumentVector = new ol.source.Vector();
	/** The source vector to handle the feature results of a OSM request.*/
	this.searchResultVector = new ol.source.Vector();
	//this.helperVector = new ol.source.Vector();
	/** The source vector to handle the features created by the user.*/
	this.drawVector = new ol.source.Vector({wrapX: false});	
	
	//this.addLayerWithSimpleStyle(this.helperVector, getDrawStyle());	
	this.addLayerWithStyleFunction(this.monumentVector, getMonumentStyles());
	this.addLayerWithStyleFunction(this.searchResultVector, getDefaultStyles()); 
	this.addLayerWithSimpleStyle(this.drawVector, getDrawStyle());
	
	/** The interaction for selecting features.*/
	this.select = new ol.interaction.Select();
	/** The selected features.*/
	this.selectedFeatures = this.select.getFeatures();
	this.map.addInteraction(this.select);
	/** The Overlay to pop up infos on map.*/
	this.popup = this.addPopup();
	
	this.addSelect();
	this.addDragBox();
	/** The interaction for drawing features.*/
	this.draw = new ol.interaction.Draw({
	      			source: this.drawVector,
	      			type:'Point',      
	      			maxPoints: 2
				});
	this.bindDraw();
	/** The interaction for modifying features.*/
	this.modify = new ol.interaction.Modify({
		features: this.selectedFeatures,
		deleteCondition: function(event) {
			return ol.events.condition.shiftKeyOnly(event) &&
		        ol.events.condition.singleClick(event);
		}
	});
	this.map.addInteraction(this.modify);
}

/** The MapController prototype.*/
MapController.prototype = {
		
		/** Creates a new ol Overlay object, adds it to the map and returns it.
		 * 
		 * @returns {ol.Overlay} The created Overlay object.
		 */
		addPopup: function() {
			var popup = new ol.Overlay({
				element: document.getElementById(this.MapView.infoId)
		    });	
			this.map.addOverlay(popup);
			return popup;
		},
		
	    /** Activates the option for drawing point objects.
	     */
		bindDraw: function() {
	    	var self = this;
	    	$('#' + self.MapView.drawId).on('change', function(e) {
	    		if ($('#' + self.MapView.drawId).is(':checked')) {
	    			self.map.addInteraction(self.draw); 
	    		} else {
	    			self.map.removeInteraction(self.draw);
	    			self.drawVector.clear();		
	    		}
	    	})
	  	},	
	
		/** Creates a DragBox interaction, used to select features by drawing boxes
		 * and adds the interaction to the map.
		 * 
		 * @returns {ol.DragBox} The created DragBox interaction.
		 */ 
	  	addDragBox: function() {
			var dragBox = new ol.interaction.DragBox({
		  		condition: ol.events.condition.platformModifierKeyOnly
			});
			this.map.addInteraction(dragBox);
			dragBox.on('boxstart', function() {
	  	  		this.selectedFeatures.clear();
	  	  		//infoBox.innerHTML = '&nbsp;';
	  		});
	  		dragBox.on('boxend', function() {
	  	  		var extent = dragBox.getGeometry().getExtent();
	  	  		this.searchResultVector.forEachFeatureIntersectingExtent(extent, function(feature) {
	  	  			this.selectedFeatures.push(feature);
	  	  		});
	  		});	
			return dragBox;
		},
		
		/**
		 * 
		 * @param id
		 * @returns {Boolean}
		
		checkHelperView: function(id) {
			var found = false;
			var singleVector = new ol.source.Vector();
        	this.helperVector.forEachFeature(function(feature) {
        		var tags = feature.get('tags');
        		$.each(tags, function(key, value) {
        			if (value === id) {
        				singleVector.addFeature(feature);
        				found = true;
					} 
				});
        	})
        	if (singleVector.getFeatures().length > 0) {
        		var extent = singleVector.getExtent();
        		this.map.getView().fit(extent, this.map.getSize());
        	}
        	return found;
		},
		 */
		
		/** Zooms the map to a chosen feature.
		 * 
		 * @param id The id of the feature to zoom to.
		 */
		setFeatureView: function(id) {
        	var singleVector = new ol.source.Vector();
        	this.monumentVector.forEachFeature(function(feature) {
        		var tags = feature.get('tags');
        		$.each(tags, function(key, value) {
        			if (value === id) {
        				singleVector.addFeature(feature);			
					} 
				});
        	})
        	if (singleVector.getFeatures().length > 0) {
        		var extent = singleVector.getExtent();
        		this.map.getView().fit(extent, this.map.getSize());
        	}
        },       
        
        /** Zooms the map, to show all currently set monument features.
         */
        setMapView: function() {
  	    	if (this.monumentVector.getFeatures().length > 0) {
  	    		var extent = this.monumentVector.getExtent();
  	    		this.map.getView().fit(extent, this.map.getSize());
  	    	}	
  	    },
		
  	    /** Zooms the map to show all features found by an actual 
  	     * request on Overpass-API. 
  	     */
  	    setOsmView: function() {
  	    	if (this.searchResultVector.getFeatures().length > 0) {
  	    		var extent = this.searchResultVector.getExtent();
  	    		this.map.getView().fit(extent, this.map.getSize());
  	    	}
  	    },
  	    
  	    /** Calls the OsmController to set his View.
  	     */
  	    setOsmInfoView: function() {
  	    	this.OsmController.setOsmView();
  	    },
  	    
  	    /** Adds the interaction option for selecting features and binds the
  	     * displayFeatureInfo-function on the selection action.
  	     */
		addSelect: function() {	
			var self = this;
			this.select.on('select', function(evt){
				self.displayFeatureInfo(self.selectedFeatures);	
			});
		},
		
		/** Clears all temporarily used feature vectors.
		 */
		clearActionFeatures: function() {
			this.selectedFeatures.clear();
  			this.searchResultVector.clear();
  			this.drawVector.clear();
		},
		
		/** Counts all monuments currently added to the map
		 * and delegates the info to the HeaderView.
		 */
		countMonuments: function() {
  			var self = this;
			var identifier = new Set()
  	    	self.monumentVector.forEachFeature(function(feature) {
  	    		var tags = feature.get('tags');
  	    		$.each(tags, function(key, value) {
  	    			identifier.add(value);
  	    		});
  	    	});
  	    	var countMonuments = identifier.size;
  	    	self.HeaderView.setMonumentCounter(countMonuments);
  		},
  		
  		/** Checks by id, if a given feature is already mapped. If such a feature 
  		 * is found, it gets deleted from the map. 
  		 * 
  		 * @param newFeature The feature to be checked.
  		 */
  		preventDoubledFeatures: function(newFeature) {
  			var doubledFeatures = new Array();
  			this.monumentVector.forEachFeature(function(feature){   						
				var tags = feature.get('tags');
  				$.each(tags, function(key, value) {
  					if (value === newFeature['recId']) {
  						doubledFeatures.push(feature);
  					}
  				}); 						
  			});
  			for (var i = 0; i < doubledFeatures.length; i++) {
  				this.monumentVector.removeFeature(doubledFeatures[i]);
  			}
  		},
  		
  		/** Sets the given response as result of a OSM request.
  		 * 
  		 * @param response The response of a OSM request.
  		 */
  		setOsmResponse: function(response){	
  			if (typeof(response) == 'number') {
  				this.OsmController.setErrorResponse(response);
  	  		} else {		
  	  			this.searchResultVector.clear();
  	  			var geojson = new ol.format.GeoJSON();
  	  			var geoFeatures = geojson.readFeatures(response);
  	  			if (geoFeatures.length > 0) {	  	  					
  	  				for (var i = 0; i < geoFeatures.length; i++) {
  	  					geoFeatures[i].getGeometry().transform('EPSG:4326', 'EPSG:3857');
  	  				}
  	  				this.searchResultVector.addFeatures(geoFeatures);			
  	  				this.setOsmView();
  	  			}
  	  			this.OsmController.setSuccessResponse(geoFeatures.length);		
  	  		}
  	  	},
  	  	
  	  	/** Creates a new vector layer for a given sourceVector, styles the features of the sourceVector
  	  	 * with a given styleToUse through a style function. Finally it adds the layer to the map. 
  	  	 * 
  	  	 * @param sourceVector The sourceVector to use.
  	  	 * @param styleToUse The style to use for the features.
  	  	 */
  	  	addLayerWithStyleFunction: function(sourceVector, styleToUse) {
  	  		var style = styleToUse;
  	  		var layer = new ol.layer.Vector({
  	  			source: sourceVector,        	
  	  			style: function(feature) {		
  	  				for (var key in style) {  
  	  					var value = feature.get('tags')[key];		
  	  					if (value !== undefined) {							
  	  						for (var regexp in style[key]) {
  	  							if (new RegExp(regexp).test(value)) {			
  	  								return style[key][regexp];
  	  							}
  	  						}      
  	  					}
  	  				} 		
  	  				return null;	  			
  	  			}
  	  		});
  	  		this.map.addLayer(layer);
  	  	},
  	  	
  	  	/** Creates a new vector layer for a given sourceVector, styles the features of the sourceVector
  	  	 * with a given styleToUse. Finally it adds the layer to the map. 
  	  	 * 
  	  	 * @param sourceVector The sourceVector to use.
  	  	 * @param styleToUse The style to use for the features.
  	  	 */
  	  	addLayerWithSimpleStyle: function(sourceVector, styleToUse) {
  	  		var style = styleToUse;
	  		var layer = new ol.layer.Vector({
	  			source: sourceVector,        	
	  			style: style, 				
	  		});
	  		this.map.addLayer(layer);
	  		
  	  	},
		
  	  	/** Gets and formats the tags of selected features to be shown in the view. 
  	  	 * If the corresponding element in the MapView is chosen by a user, the tags are shown in an
  	  	 * Overlay on the map and additionally next to the map. If the user function is not checked, 
  	  	 * the tags are just shown next to the map.
  	  	 * 
  	  	 * @param features The features to process.
  	  	 */
		displayFeatureInfo: function(features) {
        	var self = this;
			var $selectionInfo = $('#selectionInfo');
         	var element = self.popup.getElement();
  			if (features.getLength() > 0) {         
           		var infoAll = [];
            	var coordinate = features.item(features.getLength() - 1).getGeometry().getFirstCoordinate();
            	for (var i = 0, ii = features.getLength(); i < ii; ++i) {
            		var info = [];      	
            		$.each(features.item(i).get('tags'), function(key, value){
            			info.push([key + ': ' + value]);
            		});
            		infoAll.push(info.join('<br/>'));
            	}
            	$selectionInfo.html(infoAll.join('<br/><br/>'));
            	if ($('#' + this.MapView.popupId).is(':checked')) {
                	$(element).popover('destroy');
                	self.popup.setPosition(coordinate);  
                	$(element).popover({
                  	'placement': 'top',
                  	'animation': false,
                  	'html': true,
                  	'content': infoAll[infoAll.length - 1]
                	});
                	$(element).popover('show');
            	}          	
          	} else {
          		$(element).popover('destroy');
          		$selectionInfo.html('&nbsp;');
          	}
        },
        
        /** Binds the element connected to the HeaderView.mapButtonId to the zoom function
         * to show all currently mapped monuments.
         * 
         */
        activateMapView: function() {
        	var self = this;
        	$('#' + this.HeaderView.mapButtonId).on('click', function() {
        		self.setMapView();
        	});       	
        },
        
        /** Creates a multigeometry out of the given featureCollection and returns it.
         * 
         * @param featureCollection The collection to be used for the creation.
         * @returns The created multigeometry.
         */ 
        createMultiGeometry: function(featureCollection) {	
			var multigeometry = null;		
			var typeSet = new Set();
			var countFeatures = featureCollection.getLength();
			featureCollection.forEach(function(feature) {
				typeSet.add(feature.getGeometry().getType());
			});	
			if (typeSet.size > 1) {
				var geometries = [];
				for (var i = 0; i < countFeatures; i++) {
					var geometry = featureCollection.item(i).getGeometry();
					geometries.push(geometry);
				}
				multigeometry = new ol.geom.GeometryCollection();
				multigeometry.setGeometries(geometries);
			} else if (typeSet.size === 1) {
				var multiType = featureCollection.item(0).getGeometry().getType();		
	  			if (multiType === 'Polygon') {
	  				multigeometry = new ol.geom.MultiPolygon();
	  			} else if (multiType === 'LineString') {
	  				multigeometry = new ol.geom.MultiLineString();
	  			} else if (multiType === 'Point') {
	  				multigeometry = new ol.geom.MultiPoint();
	  			}
	  			for (var i = 0; i < countFeatures; i++) {
	  				var element = featureCollection.item(i).getGeometry().clone();
	  				if (multiType === 'Polygon') {
	  					multigeometry.appendPolygon(element);
	  				} else if (multiType === 'LineString') {
	  					multigeometry.appendLineString(element);
	  				} else if (multiType === 'Point') {
	  					multigeometry.appendPoint(element);
	  				}
	  			}
			}	
			return multigeometry;
		},
		
		/** Gets all currently selected features, extracts the geo infos for editing the 
		 * dataset in the model, according to the selection, formats these infos to be written
		 * in the model and returns the formatted infos.
		 * 
		 * @returns The formatted geo infos of the selected features.
		 */
		getEditData: function() {
			var data = null;
			var geometry = null; 
  			var wkt = new ol.format.WKT();		
  			var type = this.selectedFeatures.item(0).getGeometry().getType();
  			var selectedObjects = this.selectedFeatures.getLength();		
  			if (selectedObjects === 1) {
  				geometry = this.selectedFeatures.item(0).getGeometry().clone();				
  			} else if (selectedObjects > 1) {				 				
   				geometry = this.createMultiGeometry(this.selectedFeatures);
   			}
  			geometry.transform('EPSG:3857', 'EPSG:4326');
  			if (selectedObjects === 1 && type == "Point") {
  				var point = geometry.getFirstCoordinate();
  				var pointCoordinates = point.join(',');
  				data = {'point':pointCoordinates};
  			} else {
  				var wktGeometry = wkt.writeGeometry(geometry);
  				var point = null;
  				var type = geometry.getType();
  				if (type === 'GeometryCollection') {
  					point = geometry.getGeometries()[0].getFirstCoordinate();
  				} else {
  					point = geometry.getFirstCoordinate();
  				}
  				var pointCoordinates = point.join(',');
  				data = {'geometry': wktGeometry, 'point':pointCoordinates};			
  			}
  			return data;
		},
		
		/** Creates a feature by a given monument json-object and adds it to the monumentVector
		 * of the map.
		 * 
		 * @param monument The json-object with the infos about the feature to be created.
		 */
		createMonumentFeature: function(monument) {	
			var wkt = new ol.format.WKT();
			var ID = monument['recId'];
			if (monument['coordinates']) {	
				try {
					var value = monument['coordinates'].replace(' ', ',');
					var coordinates = value.split(',');
					for (element in coordinates) {
						coordinates[element] = parseFloat(coordinates[element]);
					}
					var point = new ol.geom.Point(coordinates);
					point.transform(monument['srs'], 'EPSG:3857'); 
					var newFeature = new ol.Feature(point);	
					newFeature.set('tags', {"point": ID});
	      			this.monumentVector.addFeature(newFeature);
				}
  				catch(err){
  					console.log("point problem " + err);
  				}
			}	
			if (monument['geometry']) {
				try {
					var geo = wkt.readGeometry(monument['geometry']);
					geo.transform(monument['srsGeo'], 'EPSG:3857'); 
					var type = geo.getType();
					var newFeature = new ol.Feature(geo);				
					if (type.includes('Polygon')) {
						newFeature.set('tags', {"polygon": ID});
					} else if (type.includes('LineString')) {
						newFeature.set('tags', {"line": ID});
					} else if (type.includes('Point')) {
						newFeature.set('tags', {"point": ID});
					} else if (type.includes('Collection')) {
						newFeature.set('tags', {"collection": ID});
					}
					this.monumentVector.addFeature(newFeature);
				}
				catch(err){
					console.log("polygon problem" + err);
				}  					
			}
		},
		
		/** Creates a feature by given id, type, coordinates and reference system
		 * and adds it to the monumentVector of the map.
		 * 
		 * @param featureid The id of the feature to be created.
		 * @param featurtype The type of the feature to be created.
		 * @param featurecontent The coordinates of the feature to be created.
		 * @param srs The coordinate reference system of the feature to be created.
		 */
		createFeature: function(featureid, featurtype, featurecontent, srs, srsGeo) {	
  			var wkt = new ol.format.WKT();
  			var newFeature = null;
  			var ID = featureid;
  			if (featurtype === "coordinates" ) {		
  				try {
  					featurecontent = featurecontent.replace(' ', ',');
  					var coordinates = featurecontent.split(',');
  					for (element in coordinates) {
  						coordinates[element] = parseFloat(coordinates[element]);
  					}
  					var point = new ol.geom.Point(coordinates);
  					point.transform(srs, 'EPSG:3857'); 
  					newFeature = new ol.Feature(point);	
  					newFeature.set('tags', {"point": ID});	        					
  				}
      			catch(err){
      				console.log("point problem " + err);
      			}
  			} else if (featurtype === "geometry") {
  				try {
  					var geo = wkt.readGeometry(featurecontent);
  					console.log(srsGeo);
  					geo.transform(srsGeo, 'EPSG:3857'); 
  					var type = geo.getType();
  					newFeature = new ol.Feature(geo);				
  					if (type.includes('Polygon')) {
  						newFeature.set('tags', {"polygon": ID});
  					} else if (type.includes('LineString')) {
  						newFeature.set('tags', {"line": ID});
  					} else if (type.includes('Point')) {
  						newFeature.set('tags', {"point": ID});
  					} else if (type.includes('Collection')) {
  						newFeature.set('tags', {"collection": ID});
  					} 					
  				}
  				catch(err){
  					console.log("polygon problem" + err);
  				}  					
  			}   
  			this.monumentVector.addFeature(newFeature);	
  		},
  		
  		/** Processes the resulting content of an editing.
  		 * 
  		 * @param response The content response according to the done editing process.
  		 */
  		setEditResponse: function(response) {
  			this.preventDoubledFeatures(response);
  	   		this.createMonumentFeature(response);	
  			this.countMonuments();	
  			this.setFeatureView(response.recId);	
  		},
  		
  		/** Generates an Overpass-API request from a given content, calls the request function and 
  		 * sets the callback function for the request response.
  		 * 
  		 * @param index The index value of the dataset to be used.
  		 * @param content The content of the dataset to be used.
  		 * @param responseFunction The callback function to be used.
  		 */
  		getOsmData: function(index, content, responseFunction) {		
  			this.searchResultVector.clear();
  			var data = this.OsmController.buildQuery(index, content);
  			this.OsmController.osmRequest(index, responseFunction, data);
  		}
	}
