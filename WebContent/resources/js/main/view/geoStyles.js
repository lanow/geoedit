
/** Gets the style used for monument features tagged with 'point', 'polygon', 'line' or 'collection'.*/
function getMonumentStyles() {
	var monumentStyles = {    			
		'point': {
  	  		'.*': new ol.style.Style({
  	  			image: new ol.style.Circle({ 
  	  				radius: 8,
  	  				snapToPixel: true,
  	  	    	  	stroke: new ol.style.Stroke({
  	  	    	    	color: 'rgba(0, 56, 0, 1.0)',
  	  	    	      	width: 1.5,
  	  	    	      	lineDash: [4,3]
  	  	    	  	}),
  	  	    	  	fill: new ol.style.Fill({
  	  	    	  		color: 'rgba(0, 256, 0, 0.3)'
  	  	    	   	}),                
  	  	    	})
  	  	 	})
		},  
		'polygon': {
  	  		'.*': new ol.style.Style({
  	  				stroke: new ol.style.Stroke({
  	  					color: 'rgba(0, 56, 0, 1.0)',
  	  					width: 1.5,
  	  					lineDash: [4,3]
  	  				}),
  	  	    		fill: new ol.style.Fill({
  	  	    			color: 'rgba(0, 256, 0, 0.3)'
  	  	    		}),
  	  	 	})
		},
		'line': {
  	  		'.*': new ol.style.Style({
  	  			stroke: new ol.style.Stroke({
  	  				color: 'rgba(0, 56, 0, 1.0)',
  	  				width: 1.5,
  	  				lineDash: [4,3]
  	  			}),
  	  			fill: new ol.style.Fill({
  	  				color: 'rgba(0, 256, 0, 0.3)'
  	  			}),
  	  		})
		},
		'collection': {
			'.*': new ol.style.Style({
  	  			image: new ol.style.Circle({ 
  	  				radius: 8,
  	  				snapToPixel: true,
  	  	    	  	stroke: new ol.style.Stroke({
  	  	    	    	color: 'rgba(0, 56, 0, 1.0)',
  	  	    	      	width: 1.5,
  	  	    	      	lineDash: [4,3]
  	  	    	  	}),
  	  			}),
  	  	    	fill: new ol.style.Fill({
  	  	    	  	color: 'rgba(0, 256, 0, 0.3)'
  	  	    	}), 
  	  	    	stroke: new ol.style.Stroke({
	  				color: 'rgba(0, 56, 0, 1.0)',
	  				width: 1.5,
	  				lineDash: [4,3]
  	  	    	}),
			})
		}
  	};
	return monumentStyles;
}

/** Gets the style used for a drawn points.*/
function getDrawStyle() {
	var style = new ol.style.Style({
			fill: new ol.style.Fill({
		      color: 'rgba(255, 255, 255, 0.5)'
		    }),
		    stroke: new ol.style.Stroke({
		      color: '#ffcc33',
		      width: 2,
		      lineDash: [4,3]
		    }),
		    image: new ol.style.Circle({
		      radius: 7,
		      fill: new ol.style.Fill({
		    	  color: '#ffcc33'
		      })
		    })
		});
	return style;
}

/** Gets the style used for result features of an Overpass-API-request, 
 * including the following tags: 'name', 'building', 'historic' and 'addr:housenumber'.
 */
function getDefaultStyles() { 				
  	var styles = {    		
  		'name': {
  			'.*': new ol.style.Style({
  				stroke: new ol.style.Stroke({
  					color: 'rgba(256, 0, 0, 0.6)',
  					width: 2,
  					lineDash: [4,3]
  				}),
  				fill: new ol.style.Fill({
  					color: 'rgba(256, 0, 0, 0.1)'
  				}),
  			})
  		},
  		'building': {
  			'.*': new ol.style.Style({
  				stroke: new ol.style.Stroke({
    	    		color: 'rgba(256, 0, 0, 0.8)',
    	    		width: 1,
    	    		lineDash: [4,3]
  				}),
    	    	fill: new ol.style.Fill({
    	    		color: 'rgba(256, 0, 0, 0.1)'
    	    	}),
    		})
  		},
  		'historic': {
  			'.*': new ol.style.Style({
  				image: new ol.style.Circle({ 
  					radius: 8,
    	  			snapToPixel: true,
    	  			stroke: new ol.style.Stroke({
    	  				color: 'rgba(0, 0, 0, 0.8)',
    	  				width: 1,
    	  				lineDash: [4,3]
    	         	}),
    	  			fill: new ol.style.Fill({
    	  				color: 'rgba(256, 0, 0, 0.1)'
    	        	}),                
  				})
    	    })
    	},
    	'addr:housenumber': {
    		'.*': new ol.style.Style({
    			image: new ol.style.Circle({ 
    				radius: 8,
    	  			snapToPixel: true,
    	  			stroke: new ol.style.Stroke({
    	  				color: 'rgba(256, 0, 0, 0.8)',
    	  				width: 1,
    	  				lineDash: [4,3]
    	           	}),
    	  			fill: new ol.style.Fill({
    	  				color: 'rgba(256, 0, 0, 0.1)'
    	  			}),                
    			})
    		})
    	}, 
    };
  	return styles;
}