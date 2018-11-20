require([
	"esri/views/MapView",
	"esri/WebMap",
	"esri/Graphic",
	
	"esri/widgets/Locate",
	"esri/geometry/Point",

	"dojo/domReady!"
], function (
	MapView, WebMap, Graphic,
	Locate, Point
){
	/************************************************************
	* Creates a new WebMap instance. A WebMap must reference
	* a PortalItem ID that represents a WebMap saved to
	* arcgis.com or an on-premise portal.
	************************************************************/
	var webmap = new WebMap({
		portalItem: {
			id: "7fbef6c71d3e4858abb6bf2bb9830b54"
		}
	});

	/************************************************************
	* Set the WebMap instance to the map property in a MapView.
	************************************************************/
	var view = new MapView({
		map: webmap,
		container: "mapDiv"
	});

	/************************************************************
	 * Add Locate Button to detect device GPS signal
	 ************************************************************/
	var locateWidget = new Locate({
		view: view,
		graphic: new Graphic({
    		symbol: { type: "simple-marker" }
  		})
	});
	view.ui.add(locateWidget, "top-left");

	webmap.when(function (mapObj){
		// Get Feature Layer from webmap
		gpsTrackLayer = mapObj.layers.items[0];

		// Get Device GPS Data and add to feature layer
		locateWidget.on("locate", _addFeature);
	
	}, function (error){
		console.log(error);
	});

	function _addFeature(evt){
		var point = evt.target.graphic;
			point.attributes = {};
		
		if (gpsTrackLayer.capabilities.editing.supportsGeometryUpdate){
			var promise = gpsTrackLayer.applyEdits({ addFeatures: [point] });
		}
	}
});