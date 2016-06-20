define([], function() {
  
  var style = undefined;
  var layer = undefined;
  var currentStyle = undefined;
    
  var listItems = [];

  // http://jsfiddle.net/kumarmuthaliar/GG9Sa/1/
  var modal = document.createElement("div");
  modal.id = "openModal";
  modal.className = "modalDialog";
  var modalContainer = document.createElement("div");
  var closeModal = document.createElement("a");
  closeModal.className = "close-modal btn-danger no-select";
  closeModal.href = "#close-modal";
  closeModal.title = "Close";
  closeModal.innerHTML = "X";
  closeModal.addEventListener("click", function() {
    var viewDiv = document.getElementById("viewDiv");
    viewDiv.classList.remove("no-select");
  });
  modalContainer.appendChild(closeModal);
  var preContainer = document.createElement("div");
  preContainer.className = "pre-container";
  var pre = document.createElement("pre");
  preContainer.appendChild(pre);
  modalContainer.appendChild(preContainer);
  modal.appendChild(modalContainer);
  if (!document.querySelector("modalDialog")) {
    document.body.appendChild(modal);
  }

  // findSublayers :: [String] -> [{ id: String, visible: Boolean }]
  function findSublayers(id) {
    if (currentStyle) {
      return currentStyle.layers.filter(function(layer) {
        return layer.id.indexOf(id) > -1;
      });
    }
    else {
      return [];
    }
  }

  function updateJsonDisplay() {
    pre.innerHTML = JSON.stringify(currentStyle, null, 2);
  }
  
  // updateVectorTileLayer :: { id: String, visible: Boolean } -> Void
  function updateVectorTileLayer(lyr) {
    var visibleLayers = [];
    if (lyr.visible) {
      var names = currentStyle.layers.map(function(x) {
        return x.id;
      });
      visibleLayers = style.layers.filter(function(x, idx) {
        return x.id.indexOf(lyr.id) > -1 || names.indexOf(x.id) > -1;
      });
      currentStyle.layers = visibleLayers;
    }
    else  {
      visibleLayers = currentStyle.layers.filter(function(x) {
        return x.id.indexOf(lyr.id) < 0;
      });
      currentStyle.layers = visibleLayers;
      
    }
    updateJsonDisplay();
    layer.loadStyle(Object.assign({}, currentStyle));
  }

  // createSublistContainer :: 
  function createSublistContainer(ids) {
    var list = document.createElement("ul");
    list.className = "list-group float-group";
    var docFrag = document.createDocumentFragment();
    listItems = ids.map(function(x) {
      var id = x.id;
      var li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = id;
      var span = document.createElement("span");
      if (x.visible) {
        span.className = "pull-right esri-icon-checkbox-checked"
      }
      else {
        span.className = "pull-right esri-icon-checkbox-unchecked"
      }
      span.addEventListener("click", function() {
        span.classList.toggle("esri-icon-checkbox-checked");
        span.classList.toggle("esri-icon-checkbox-unchecked");
        x.visible = !x.visible;
        updateVectorTileLayer(x);
      });
      li.appendChild(span);
      docFrag.appendChild(li);
      return li;
    });
    list.appendChild(docFrag);
    return list;
  }
  
  // createListContainer :: [{ id: String, visible: Boolean }] -> HTMLElement
  function createListContainer(ids) {
    var list = document.createElement("ul");
    list.className = "list-group layer-list";
    var docFrag = document.createDocumentFragment();
    listItems = ids.map(function(x) {
      var id = x.id;
      var li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = id;
      var span = document.createElement("span");
      if (x.visible) {
        span.className = "pull-right esri-icon-checkbox-checked"
      }
      else {
        span.className = "pull-right esri-icon-checkbox-unchecked"
      }
      var settings = document.createElement("span");
      settings.className = "pull-right esri-icon-settings vt-settings"
      span.addEventListener("click", function() {
        span.classList.toggle("esri-icon-checkbox-checked");
        span.classList.toggle("esri-icon-checkbox-unchecked");
        x.visible = !x.visible;
        updateVectorTileLayer(x);
      });
      var sublayers = findSublayers(id);
      sublayers.forEach(function(subLayer) {
        subLayer.visible = !!x.visible;
      });
      var sublayerList = createSublistContainer(sublayers);
      sublayerList.style.display = "none";
      settings.addEventListener("click", function() {
        if (sublayerList.style.display === "none") {
          sublayerList.style.display = "block";
        }
        else {
          sublayerList.style.display = "none";
        }
      });
      li.appendChild(span);
      li.appendChild(settings);
      li.appendChild(sublayerList);
      docFrag.appendChild(li);
      return li;
    });
    list.appendChild(docFrag);
    return list;
  }

  // createHeader :: String -> HTMLElement
  function createHeader(name) {
    var header = document.createElement("div");
    header.className = "list-header";
    var title = document.createElement("span");
    title.innerText = name + "    ";
    var openModal = document.createElement("a");
    openModal.href = "#openModal";
    openModal.addEventListener("click", function() {
      var viewDiv = document.getElementById("viewDiv");
      viewDiv.classList.add("no-select");
      pre.focus();
    });
    var download = document.createElement("span");
    download.className = "esri-icon-download download";
    openModal.appendChild(download);
    header.appendChild(title);
    header.appendChild(openModal);
    return header;
  }
  
  // create :: Options -> HTMLElement
  function create(spec) {
    style = spec.style;
    layer = spec.layer;
    currentStyle = Object.assign({}, style);
    var raw_ids = style.layers.map(function(lyr) {
      return lyr.id.split("/")[0];
    });
    var ids = raw_ids.filter(function(x, idx) {
      return raw_ids.indexOf(x) === idx;
    })
    .sort()
    .map(function(x) {
      return { id: x, visible: true };
    });
    var list = createListContainer(ids);
    var container = document.createElement("div");
    var header = createHeader("Vector Tile Layer");
    container.className = "vt-list";
    container.appendChild(header);
    container.appendChild(list);
    updateJsonDisplay();
    return container;
  }

  return Object.freeze({
    create: create
  });
  
});