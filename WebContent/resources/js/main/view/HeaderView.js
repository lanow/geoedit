/**The HeaderView to position and show the Header. It provides elements to navigate 
 * through the page.
 * 
 * @param headerId
 */
function HeaderView(headerId) {
	/** The identifier to position the header. */
	this.headerId = headerId;
	/** The identifier of the element to zoom to the currently mapped monuments.*/
	this.mapButtonId = 'monumentMap';
	/** The identifier of the element to show the amount of currently mapped monuments.*/
	this.counterId = 'monumentCount';
	/** The identifier of the element to navigate to the file handler.*/
	this.fileViewId = 'file-view';
	/** The identifier of the element to navigate to the record handler.*/
	this.recordViewId = 'record-view';
}
/** The HeaderView prototype*/
HeaderView.prototype = {
		
		/** Initializes the HeaderView */
		init: function() {
			var $navbar = $('#' + this.headerId);
			var $container = $('<div>').addClass('container-fluid');
			var $header = $('<div>').addClass('navbar-header');
			$('<a>').addClass('navbar-brand').attr('href', '/s0538333-GeoEdit/').text('GeoEdit').appendTo($header);
			
			var $navigation = $('<ul>').addClass('nav navbar-nav');
			
			var $files = $('<li>').attr('class', 'nav-item');
			var $fileLink = $('<a>').text('Files').attr('type', 'button').attr('title', "go to files").attr('id', this.fileViewId).appendTo($files);
			$files.appendTo($navigation);
			var $records = $('<li>').attr('class', 'nav-item');
			var $recordLink = $('<a>').text('Records').attr('type', 'button').attr('title', "go to records").attr('id', this.recordViewId).appendTo($records);
			$records.appendTo($navigation);
			
			var $map = $('<div>').addClass('collapse navbar-collapse'); 
			var $ul = $('<ul>').addClass('nav navbar-nav navbar-right');
			
			var $mapReload = $('<li>');
			var $mapIcon = $('<a>').attr('id', this.mapButtonId).attr('type', 'button');
			var $img = $('<img>').attr('src', './resources/css/map_reload.png').attr('alt', 'Mapoverview').attr('title', 'Show all monuments').attr('height', '18').attr('width', '18');
			$img.appendTo($mapIcon);
			$mapIcon.appendTo($mapReload);
			$mapReload.appendTo($ul);			
			
			var $monumentCount = $('<li>');
			var $counter = $('<a>').text('Monuments: ');
			$('<span>').attr('id', this.counterId).attr('class', 'badge').attr('title', 'Mapped monuments').text('0').appendTo($counter);
			$counter.appendTo($monumentCount);
			$monumentCount.appendTo($ul);	
			$ul.appendTo($map);
			
			$header.appendTo($container);
			$navigation.appendTo($container);
			$map.appendTo($container);
			
			$container.appendTo($navbar);
		},
		
		/** Sets the given amount of monuments as amount of currently mapped monuments.
		 * 
		 * @param countMonuments The amount to be set.
		 */
		setMonumentCounter: function(countMonuments) {
			$('#' + this.counterId).text(countMonuments);
		}
}