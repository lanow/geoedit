/** The OsmView provides infos about the process and result of an OSM-request. 
 */
function OsmView() {
	/** The identifier for an img element representing a processing. */
	this.loadingLabelId = 'loading';
	/** The identifier for a element providing text info about search processing and result.*/
	this.searchLabelId = 'searchLabel';
}
/** The OsmView prototype.*/
OsmView.prototype = {
	/** Initializes the OSM-view.
	 */
	init: function() {
		$('#' + this.searchLabelId).text("OSM search");
	},

	/** Sets the error code of a failed OSM-request.
	 * 
	 * @param response The error response to be set.
	 */
	setOsmErrorResponse: function(response) {
		$('#' + this.loadingLabelId).remove();
		$('#' + this.searchLabelId).text('Error ' + response);
	},
	
	/** Sets the amount of found OSM-features.
	 * 
	 * @param featureCount The amount of found OSM-features.
	 */
	setOsmSuccessResponse: function(featureCount) {
		$('#' + this.loadingLabelId).remove();
		$('#' + this.searchLabelId).text(featureCount + " OSM feature(s) found"); 
		$('#edit-button').show();
	},
	
	/** Sets the info, that a OSM request is currently running. 
	 */
	setOsmSearch: function() {
		$('#' + this.searchLabelId).text("Searching ... "); 
		var $loading = $('<img>').attr('src', './resources/css/loading.gif').attr('id', this.loadingLabelId);
	  	$loading.appendTo($('#' + this.searchLabelId));	
	},
};