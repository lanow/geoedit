/** The MapModel represents the map with its basic layer (OSM tiles), initial view and basic 
 * control options like zoom functionality, the display of attributions and mouse control.
 * 
 * @param mapId The identifier to set.
 */
function MapModel(mapId) {
	/** The identifier to connect MapModel and MapView.*/
	this.mapId = mapId;
	/** The map object with the basic functions.*/
	this.map = new ol.Map({

		target: this.mapId,	
		layers: [new ol.layer.Tile({
						source: new ol.source.OSM(),
					})
				],
		renderer: 'canvas',   
		view: new ol.View({
  			center: ol.proj.transform([13.40, 52.51], 'EPSG:4326', 'EPSG:3857'),
  			maxZoom: 19,
  			zoom: 10
		}),
		
	    controls: [             
			new ol.control.Zoom(),
			new ol.control.Attribution({
				attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
					collapsible: false
					})
				}),
			new ol.control.MousePosition({
				coordinateFormat: function (coordinates) {
	        		var coord_x = coordinates[0].toFixed(3);
	        		var coord_y = coordinates[1].toFixed(3);
	        		return coord_x + ', ' + coord_y;
	    		},	
				projection: 'EPSG:4326',
				undefinedHTML: '&nbsp;',
				target: 'coordinates',
			}),
		], 
		pixelRatio: 1
	});
}