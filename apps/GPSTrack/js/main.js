require([
	'esri/views/MapView',
	'esri/WebMap',
	'esri/Graphic',
	
	'esri/widgets/Locate',
	'esri/geometry/Point',
	'esri/tasks/support/Query',

	'dojo/domReady!'
], function (
	MapView, WebMap, Graphic,
	Locate, Point, Query
){
	/************************************************************
	* Creates a new WebMap instance. A WebMap must reference
	* a PortalItem ID that represents a WebMap saved to
	* arcgis.com or an on-premise portal.
	************************************************************/
	var webmap = new WebMap({
		portalItem: {
			id: '7fbef6c71d3e4858abb6bf2bb9830b54'
		}
	});

	/************************************************************
	* Set the WebMap instance to the map property in a MapView.
	************************************************************/
	var view = new MapView({
		map: webmap,
		container: 'mapDiv'
	});

	/************************************************************
	 * Add Locate Button to detect device GPS signal
	 ************************************************************/
	var locateWidget = new Locate({
		view: view,
		graphic: new Graphic({
    		symbol: { type: 'simple-marker' }
  		})
	});
	view.ui.add(locateWidget, 'top-left');

	/*************************************************
     * bind get current position functionailty
	 **************************************************/
	var runGPS = null;
	webmap.when(function (mapObj){
		// Get Feature Layer from webmap
		gpsTrackLayer = mapObj.layers.items[0];

		// Get Device GPS Data and add to feature layer
		locateWidget.on('locate', _addFeature);
		locateWidget.on('locate-error', _errorHandler);

		// Bind Button Event
		document.getElementById('switch').addEventListener('click', _autoRunGPS);
		document.getElementById('removeTrack').addEventListener('click', _removeTrack);

	}, function (error){
		alert('無法載入Web Map');
		return;
	});

	function _addFeature(evt){
		var point = evt.target.graphic;
			point.attributes = {};
		
		if (gpsTrackLayer.capabilities.editing.supportsGeometryUpdate){
			var promise = gpsTrackLayer.applyEdits({ addFeatures: [point] });
		}
	}

	function _errorHandler(error){
		console.log(error);
		return;
	}

	function _autoRunGPS(){
		var swap = this.getAttribute('class');
		
		if(swap === 'off'){
			this.classList.remove('off');
			this.classList.add('on');
			runGPS = setInterval(function (){ locateWidget.locate() }, 3000);
		}
		
		if(swap === 'on'){
			this.classList.remove('on');
			this.classList.add('off');
			clearInterval(runGPS);
		}
	}
	
	function _removeTrack(){
		var query = new Query();
			query.where = '1=1';
			query.outSpatialReference = { wkid: 4326 };
			query.returnGeometry = true;
			query.outFields = ['*'];

		gpsTrackLayer.queryFeatures(query).then(function (response){
			if (gpsTrackLayer.capabilities.editing.supportsDeleteByAnonymous){
				gpsTrackLayer.applyEdits({deleteFeatures: response.features});		
			}
		}, _errorHandler);
	}
});