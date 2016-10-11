	//init functions		
	var headerView = new HeaderView('header');
	var osmView = new OsmView();
	var fileView = new FileView('#file-handler', '#content-handler', '#selection-handler');
	var mapView = new MapView('map-handler');		
	
	headerView.init();
	fileView.init();
	mapView.init();
	
	var map = new MapModel('map');
	var osmController = new OsmController(osmView);
	var mapController = new MapController(mapView, headerView, map, osmController);
	var fileController = new FileController(fileView, headerView, mapController);					
	
	fileController.init();		
	mapController.activateMapView();	
	
	
  	
  	