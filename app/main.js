define([
  "esri/config",
  "esri/request",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/VectorTileLayer",
  "esri/widgets/Search",
  "./components/list",
  "dojo/domReady!"
], function(
  esriConfig,
  esriRequest,
  Map,
  MapView,
  VectorTileLayer,
  Search, List) {
    
  //esriConfig.request.proxyUrl = "/proxy/proxy.php";

  var map = new Map();

  var tileLyr = new VectorTileLayer({
    url: "https://maps.arcgis.com/sharing/rest/content/items/aa826fe4f83e4b5eb39993aa3c7b7043/resources/styles/root.json"
  });
  map.add(tileLyr);

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-118.24, 34.04], // lon, lat
    zoom: 15,
    ui: {
      components: [
        "zoom",
        "attribution",
        "compass"
      ]
    }
  });

  var searchWidget = new Search({
    viewModel: {
      view: view
    }
  });
  searchWidget.startup();
  /* debugging
  view.watch("center", function(center) {
    console.log(center.longitude, center.latitude);
  });
  */

  // Add the search widget to the top left corner of the view
  view.ui.add(searchWidget, {
    position: "top-right",
    index: 1
  });

  esriRequest(tileLyr.url, { f: "json" }).then(function(response) {
    var vtStyle = response.data;
    var list = List.create({
      style: vtStyle,
      layer: tileLyr
    });
    view.ui.add(list, "bottom-left");
  });

});