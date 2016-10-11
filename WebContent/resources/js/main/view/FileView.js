/** The FileView to position and show the infos about available files, 
 * the content of a processed file and the user elements to process files
 * and file content.
 * 
 * @param fileHandlerId The identifier of the anchor element for the file handler to set. 
 * @param parsingHandlerId The identifier of the anchor element for the record handler to set.
 * @param selectionHandlerId The identifier of the anchor element for the selection field to set.
 */
function FileView(fileHandlerId, parsingHandlerId, selectionHandlerId) {
	/** The identifier of the anchor element for the file handler.*/
	this.fileHandlerId = fileHandlerId;
	/** The identifier of the anchor element for the record handler.*/
	this.parsingHandlerId = parsingHandlerId;
	/** The identifier of the anchor element for the selection field.*/
	this.selectionHandlerId = selectionHandlerId;
	/** The identifier for the element to show all available files.*/
	this.availableFilesId = 'files';
	/** The identifier for an input element to process file actions.*/
	this.currentFileId = 'file';
	/** The identifier for the element that holds the title of the currently chosen file.*/
	this.chosenFileId = 'chosenFile';
	/** The identifier for the upload button.*/
	this.uploaderId = 'file-uploader';
	/** The identifier for the parse button.*/
	this.parserId = 'parseButton';
	/** The identifier for the download button.*/
	this.downloadId = 'download';
	/** The identifier for the delete button.*/
	this.deleteId = 'delete';
	/** The identifier for the element to inform about the amount of parsed records.*/
	this.recordCountId = 'recordCount';
}
/**The FileView prototype.
 */
FileView.prototype = {
		/** Initializes the basic parts of the file view. 
		 */
		init: function() {
			this.initFileHandling();
			this.initContentHandling();
			this.getAvailableFiles();
		},
		
		/** Initalizes the view for available files and possible file actions.
		 */
		initFileHandling: function() {
			var $fileHandler = $(this.fileHandlerId);		
			var $file = $('<input>').attr('type', 'hidden').attr('id', this.currentFileId).attr('name', 'file').val('');
			$file.appendTo($fileHandler);		
			var $fileSelect = $('<select>');		
			$fileSelect.addClass('form-control').attr('title', 'Available files');
			$fileSelect.attr('name', 'files').attr('id', this.availableFilesId);
			$('<option>').appendTo($fileSelect);
			$fileSelect.appendTo($fileHandler)		
			var $fileUpload = $('<span>').attr('class', 'btn qq-upload-button').attr('id', this.uploaderId);
			var $uploadA = $('<a>').attr('class', 'btn btn-default').attr('id', 'upload').attr('type', 'button');
			$('<span>').attr('class', 'glyphicon glyphicon-upload').appendTo($uploadA);
			$uploadA.appendTo($fileUpload);	
			
			var $downloadButton = $('<a>').addClass('btn btn-default').attr('title', 'Download file');
			$downloadButton.attr('id', this.downloadId).attr('target', '_self');
			$('<span>').addClass("glyphicon glyphicon-download").appendTo($downloadButton);		
			
			var $deleteButton = $('<a>').addClass('btn btn-default').attr('title', 'Delete file');
			$deleteButton.attr('id', this.deleteId);
			$('<span>').addClass("glyphicon glyphicon-trash").appendTo($deleteButton);
						
			var $fileInfo = $('<label>').attr('id', 'chosenFile');
			$fileInfo.appendTo($fileHandler);
			var $parseDiv = $('<div>').attr('id', 'parsediv');	
			var $parseButton = $('<input>').attr('class', 'btn btn-default parsefile').attr('type', 'button').attr('value', 'Parse file').attr('id', this.parserId);
			
			var parseElements = Array($fileUpload, $downloadButton, $deleteButton, $parseButton);
			this.appendElements(parseElements, $parseDiv);
			
			$parseDiv.appendTo($fileHandler);
			
			$fileHandler.collapse('show');
		},
		
		/** Initializes the view for parsed records.
		 */
		initContentHandling: function() {
			var $parsingHandler = $(this.parsingHandlerId);	
			var $parsedDropdown = $('<div>').attr('class', 'dropdown');
			$parsedDropdown.text('Records: ');
			var $recordCount = $('<span>').attr('class', 'badge').attr('id', this.recordCountId).text('0');
			$recordCount.appendTo($parsedDropdown);
			$parsedDropdown.appendTo($parsingHandler)
			var $resultList = $('<ul>').attr('id', 'dropdown-menu').attr('class', 'list-group');
			var $firstResult = $('<li>');
			$('<div>').text('No records parsed').appendTo($firstResult);
			$firstResult.appendTo($resultList);
			$resultList.appendTo($parsingHandler);
			
			$parsingHandler.hide();
		},
				
		/** Creates the view for a single selected dataset.
		 * 
		 * @param point An element that represents infos about possible point coordinates of the dataset.
		 * @param poly An element that represents infos about possible geometry coordinates of the dataset.
		 * @param row An element to hold describing identifying infos about the dataset.
		 */
		createSelectedField: function(point, poly, row) {
	  		if ($(this.selectionHandlerId).children().length > 0){
	  	 		$(this.selectionHandlerId).empty();
	  	  	}
	  	  	var $field = $('<ul>').addClass("list-group selection-field");	
	  	  	var $searchStatus = $('<li>').addClass("list-group-item").attr('id', 'searchStatus');		
	  	  	var $geoStatus = $('<li>').addClass("list-group-item").attr('id', 'geo-status');
	  	  	var $text = $('<li>').addClass("list-group-item")
	  	  	var $selectionInfo = $('<li>').addClass("list-group-item").attr('id', 'selectionInfo');
	  	  	var $selectionLabel = $('<label>').attr('id', 'searchLabel');
	  	  	$selectionLabel.appendTo($searchStatus); 	
	  	  	var $editButton = $('<button>').addClass("btn btn-default pull-right").attr('id', 'edit-button').attr('title', 'Edit geoReference');
	  	  	$('<span>').addClass('glyphicon glyphicon-pencil').appendTo($editButton);
	  	  	var $deleteButton = $('<button>').addClass("btn btn-default pull-right").attr('id', 'delete-button').attr('title', 'Remove geoReference');
		  	$('<span>').addClass('glyphicon glyphicon-remove').appendTo($deleteButton); 	
	  	  	var $mapButton = $('<button>').addClass("btn btn-default pull-right").attr('id', 'map-button').attr('title', 'Zoom to feature');
	  	  	$('<span>').addClass('glyphicon glyphicon-zoom-in').appendTo($mapButton);
	  	  	var $searchButton = $('<button>').addClass("btn btn-default pull-right").attr('id', 'search-button').attr('title', 'Start OSM search');
	  	  	$('<span>').addClass('glyphicon glyphicon-refresh').appendTo($searchButton);	
	  	  	var $lockButton = $('<button>').addClass("btn btn-default pull-right").attr('id', 'lock-button').attr('title', 'Enable editing');  	
	  	  	var $locker = $('<i>').attr('area-hidden', 'true').attr('id', 'locker');		
	  	  	this.setActionsVisibility(point, poly, $locker, $mapButton, $deleteButton, $editButton, $lockButton);
			point.attr('id', 'selection-point');
	  	  	poly.attr('id', 'selection-geo');		
	  	  	$locker.appendTo($lockButton);
	  	  	row.appendTo($text);  		 	  	
	  	  	var geoArray = Array(point, poly, $mapButton, $deleteButton, $editButton, $lockButton);
	  	  	this.appendElements(geoArray, $geoStatus); 	  	
	  	  	$searchButton.appendTo($searchStatus);	
	  	  	var fieldArray = Array($searchStatus, $geoStatus, $text, $selectionInfo);
	  	  	this.appendElements(fieldArray, $field);	  	
	  	  	$field.appendTo($(this.selectionHandlerId));
	  	  	
	  	  	this.bindLockAction('#lock-button');
	  	},		
	  	
	  	/** Sets the visibility of currently allowed action elements, according to the georeferences 
	  	 * of the the dataset.
	  	 * 
	  	 * @param point An element that represents infos about possible point coordinates of the dataset.
		 * @param poly An element that represents infos about possible geometry coordinates of the dataset.
	  	 * @param $locker An element that holds the visible representation for lock/unlock.
	  	 * @param $mapButton An element that represents a button for zooming to feature belonging to the dataset.
	  	 * @param $deleteButton An element that represents a button for deleting the georeference of a single dataset.
	  	 * @param $editButton An element that represents a button for editing the georeference of a single dataset.
	  	 * @param $lockButton An element that represents a button for toggling the lock/unlock for manipulating
	  	 * the georeference of a dataset.
	  	 */
	  	setActionsVisibility: function(point, poly, $locker, $mapButton, $deleteButton, $editButton, $lockButton) {
	  	  	if (point.attr('class').includes('btn-danger') && poly.attr('class').includes('btn-danger')) {
				$locker.addClass("fa fa-unlock-alt");
				$mapButton.hide();
				$deleteButton.hide();
				$editButton.hide();
				$lockButton.hide();
			} else {
				$locker.addClass("fa fa-lock");
				$mapButton.show();
				$deleteButton.show();
				$editButton.show();
				$lockButton.show();
			}
		},
	  	
		/** Binds the toggling between the CSS classes 'fa fa-unlock-alt' and 'fa fa-lock'
		 * to the click-event of an element with the given lockButtonID.
		 * 
		 * @param lockButtonID The id of the element to be toggled.
		 */	
		bindLockAction: function(lockButtonID) {
	  	  	$(lockButtonID).on('click', function() {
		  		$('#locker').toggleClass("fa fa-unlock-alt");
		  		$('#locker').toggleClass("fa fa-lock");	
		  	});
	  	},
		
	  	/** According to a given boolean value the Bootstrap CSS classes 'btn-success' and 
	  	 * 'btn-danger' will be added or removed to a given element. 
	  	 * 
	  	 * @param element The element to manipulate
	  	 * @param value The boolean to indivate the action.
	  	 */
		toggleBtnDangerSuccess: function(element, value) {
      		if (value === 'false') {
      			element.removeClass("btn-success").addClass("btn-danger");
      		} else {		
      			element.removeClass("btn-danger").addClass("btn-success");
      		}
  		},
  		
  		/** Sets the currently processable file options. If at least one file is uploaded
  		 * this means 'parse', 'download', 'delete', 'upload'. Otherwise just the upload 
  		 * option will be shown.
  		 */
  		setFile: function () {
			var $selectedFile = $('#' + this.availableFilesId).val();		
			if ($selectedFile != '') {
				$('#' + this.parserId).val("Parse file").show();
				$('#' + this.downloadId).show();
				$('#' + this.deleteId).show();
				$('#' + this.chosenFileId).html("");
			} else {
				$('#' + this.parserId).hide();
				$('#' + this.downloadId).hide();
				$('#' + this.deleteId).hide();
				$('#' + this.chosenFileId).html(" No files available, try upload!");
			}
		},
		
		/** Sets the view to a selected dataset.
  		 * Selectable files and records overview will be hidden.
  		 */
		setSelectionView: function() {
  			$(this.parsingHandlerId).hide();
  			$(this.fileHandlerId).hide();
  			$(this.selectionHandlerId).show();
  		},
  		
  		/** Sets the view to the selectable files and file actions.
  		 * Record overview and selected datasets will be hidden.
  		 */
  		setFileView: function() {
			$(this.parsingHandlerId).hide();
			$(this.selectionHandlerId).hide();
			$(this.fileHandlerId).show();	
  		},
  		
  		/** Sets the view to the record overview.
  		 * Selectable files and selected datasets will be hidden.
  		 */
  		setRecordView: function() {
  			$(this.fileHandlerId).hide();
  			$(this.selectionHandlerId).hide();
	  		$(this.parsingHandlerId).show();
  		},
  		
  		/**
  		 */ 
  		
  		getAvailableFiles: function() {
			var self = this;
			$.post("check", function(responseText) {
				self.setAvailableFiles(responseText);
	    	});
		},
		 
  		
  		/** Sets a list of given file names as selectable files.
  		 * 
  		 * @param fileNames A list of file names to be set.
  		 */
  		setAvailableFiles: function(fileNames) {
			var $select = $('#' + this.availableFilesId);
			$select.empty();
    		var files = fileNames;
    		var $option = null;
			var filesREP = files.replace(/ |\[|\]/g, '');
			var parts = filesREP.split(",")
			for (var i in parts) {
				$option = $('<option>');
	       		$option.val(parts[i]).html(parts[i]);
	       		$option.appendTo($select);
			}
			this.setFile();
		},
  		
		/** Prepares the FileView for a parsing process.
		 */
  		prepareParsing: function() {
  			$("#searchLabel").text("");
  			if ($("#selectedMonument").children().length > 0){
      			$("#selectedMonument").empty();
      		}
  			var $parsediv = $('#parsediv');
  			var $loading = $('<img>').attr('src', './resources/css/loading.gif').attr('id', 'loading');		
  			$loading.appendTo($('#parsediv'));
  		},
  		
  		/** Sets the currently allowed elements to manipulate the file model,
  		 * according to the given response.
  		 * 
  		 * @param response The response that informs about the current content of a dataset.
  		 */
  		updateRecordOptions: function(response) {
  			if (response['hasPoly'] === 'true' | response['hasPoint'] === 'true') {
  				$('#map-button').show();
  				$('#delete-button').show();
  				$('#edit-button').show();
  				$('#locker').attr('class', 'fa fa-lock');
				$('#lock-button').show();
  			} else {
  				$('#map-button').hide();
  				$('#delete-button').hide();
  				$('#edit-button').show();
  				$('#locker').attr('class', 'fa fa-unlock-alt');
				$('#lock-button').hide();
  			} 			
  		},
  		
  		/** 
  		 * 
  		 * @param action
  		 * @param callback
  		 */
		action: function(action, callback) {
			var self = this;
			var file = $('#' + self.availableFilesId).val();		
	 		$.ajax({
	  			type: 'POST',
	  			url: action,
	  			data: {'file': file},
	  			success: function(response){								
	  				if (action === 'parse') {	
	  					callback(response);
	  				} 	
	  			}
	  		});
		},
		
		
		/** Appends all elements in a given array to a given parent element.
		 * 
		 * @param elementArray The array that provides all elements to append.
		 * @param parentElement The element to append to.
		 */
		appendElements: function(elementArray, parentElement) {
	  		for (var i in elementArray) {
	  			elementArray[i].appendTo(parentElement);
	  		}
	  	},
	  	
	  	/** Creates the elements for a single row in the record view.
	  	 * 
	  	 * @param index The index value of the row to create.
	  	 */
	  	createContentRow: function(index) {
	  		var $infoDiv = $('<div>').attr('id', 'info-text' + index);
			$('<br>').appendTo($infoDiv);
			var $point = $("<span>").addClass("glyphicon glyphicon-map-marker pull-left").attr('id', 'point' + index);
			var $poly = $("<span>").addClass("glyphicon glyphicon-globe pull-left").attr('id', 'geo' + index);	        	
			var $li = $('<li>').addClass('list-group-item btn btn-default').attr('id', 'li' + index);	
			$('<br>').appendTo($li);
			$li.prepend($poly);
		    $li.prepend($point);
		    var $row = $("<div>").val(index).attr('id', 'row' + index);
		    $infoDiv.prepend($row);
		    $infoDiv.appendTo($li); 
			$li.appendTo($("#dropdown-menu"));
	  	},
	  	
	  	/** Clears the elements of a record view and sets up a fresh record view.
	  	 * 
	  	 * @param result The result of the latest parsing process.
	  	 */
	  	setParseResponse: function(result) {
	  		$('#loading').remove();		
	  		var $menu = $("#dropdown-menu");                           
	  		if ($menu.children().length > 0){
	  			$menu.empty();
	      	}			
			$("#recordCount").text(result.length);	
			if (result.length > 0) {
				this.setRecordView();
			}
	  	},
	  	
	  	/** Updates the visible infos and options of a single dataset according to the result
	  	 * of an editing process.
	  	 * 
	  	 * @param response The result of an editing process.
	  	 */
	  	setEditResponse: function(response) {
	  		this.updateRecordOptions(response);	
			this.toggleBtnDangerSuccess($("#geo" + response.index), response['hasPoly']);
	  		this.toggleBtnDangerSuccess($('#selection-geo'), response['hasPoly']);
	   		this.toggleBtnDangerSuccess($("#point" + response.index), response['hasPoint']);
	   		this.toggleBtnDangerSuccess($('#selection-point'), response['hasPoint']);
	  	}
};