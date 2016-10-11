/** The MapView to position and show the Map. It also provides checkable options for the user 
 * to decide about special map functionalities.
 * 
 * @param mapHandlerId The mapHandlerId to set.
 */
function MapView(mapHandlerId) {
	/** The mapHandlerId to position the map.*/
	this.mapHandlerId = mapHandlerId;
	/** The identifier to be used as anchor for the MapModel.*/
	this.mapId = 'map';
	/** The identifier for a checkable element to decide about the possibility to draw point objects.*/
	this.drawId = 'drawPoint';
	/** The identifier for an element to show attributions.*/
	this.infoId = 'info';
	/** The identifier for a checkable element to decide about a pop up on map.*/
	this.popupId = 'showInfoOnMap';
	
	}
	/** The MapView prototype */
	MapView.prototype = {
		
		/** Initializes the map view.
		 */
		init: function() {
			var $mapHandler = $('#' + this.mapHandlerId);
			var $notificationBar = $('<div>').attr('class', 'notification-bar');
			var $messageBar = $('<div>').attr('class', 'message-bar').attr('id', 'messageBar');
			$('<input>').attr('type', 'checkbox').attr('id', this.popupId).appendTo($messageBar);
			$('<label>').attr('for', this.popupId).text('popup feature info').appendTo($messageBar);
			$('<input>').attr('type', 'checkbox').attr('id', this.drawId).appendTo($messageBar);
			$('<label>').attr('for', this.drawId).text('draw point').appendTo($messageBar);
			$messageBar.appendTo($notificationBar);
			$('<div>').attr('id', 'coordinates').attr('class', 'pull-right').appendTo($notificationBar);
			
			$notificationBar.appendTo($mapHandler);
			
			$('<div>').attr('class', 'smallmap').attr('id', this.mapId).appendTo($mapHandler);
			$('<div>').attr('id', this.infoId).appendTo($mapHandler);
			
		}
}