let bufferShown = false;
let hoveredPointId =  null;

function queryMap() {

    const dataName = ["OGF_ID"];

    // array to hold rendered features
    const featureArray = [];

    // path data within map view on load
    const features = map.queryRenderedFeatures({layers:['pathsLayer']});

    for (var i=0;i<features.length;i++) {

        const path = features[i].geometry.coordinates;

	    // array to hold attribute names for popup
	    let featureNameArray = {};

	    for (var p=0;p<dataName.length;p++) {

			pushToAry(dataName[p]);

        	function pushToAry(name) {
			    featureNameArray[name] = features[i].properties[name];
			}

		}

        let multiTrue = determineMulti(path);
        let bufferPath;
        if (multiTrue) {
            bufferPath = turf.multiLineString(path, featureNameArray);
        } else {
            bufferPath = turf.lineString(path, featureNameArray);
        }
        featureArray.push(bufferPath);

        if (i==features.length-1) {
            generateBuffers(featureArray);
        }
    };
};

function determineMulti(data) {
    let multi = false;
    for (let p=0;p<=data.length;p++) {
        if (Array.isArray(data[p][0])) {
            multi = true;
            return multi;
        }
        if (p === data.length-1) {
            return multi;
        }
    }
}

function generateBuffers(data) {

    const collection = turf.featureCollection(data);
    const bufferCollection = turf.featureCollection([]);
    const features = bufferCollection.features;

    let bufferSize = getBufferSize();

    turf.featureEach(collection, function (currentFeature, featureIndex) {
        const bufferPolygons = turf.buffer(currentFeature, bufferSize, {units: 'meters'});
        features.push(bufferPolygons);
    });

    addBufferLayer(bufferCollection);

}

function addBufferLayer(data) {

    if (initLoad) {

        initLoad = false;
        map.addSource('bufferData', {
            type: 'geojson',
            data: data
        });

        map.addLayer({
            'id': 'bufferLayer',
            'type': 'fill',
            'source': 'bufferData',
            'layout': {},
            'paint': {
                'fill-color': 'rgb(255,255,255)',
                "fill-opacity": 0,
                'fill-outline-color': 'coral'
            }
        }, 'pathsLayer');

        map.on('mousemove', 'bufferLayer', hoverState);
        map.on('mouseleave', 'bufferLayer', hoverStateOff);

    } else {
        map.getSource('bufferData').setData(data);
    }

}

function hoverState(e) {
    map.getCanvas().style.cursor = 'pointer';

    if (e.features.length > 0) {
        if (hoveredPointId !== null) {
            map.setFeatureState(
                { source: 'paths', id: hoveredPointId },
                { hover: false }
            );
        }
        hoveredPointId = e.features[0].properties.OGF_ID;
        
        map.setFeatureState(
            { source: 'paths', id: hoveredPointId },
            { hover: true }
        );

        const feature = map.querySourceFeatures("paths", { sourceLayer: ['pathsLayer'], filter: ['==', 'OGF_ID', hoveredPointId] });
        const attributes = {
            'OGF_ID': feature[0].properties.OGF_ID,
            'TRAIL_NAME': feature[0].properties.TRAIL_NAME,
            'ASSOC': feature[0].properties.ASSOC
        };

        const attributesArray = [];

        Object.keys(attributes).forEach(function(key) {
            attributesArray.push('<b>' + key + '</b>: ' + attributes[key] + '<br>');
        });

        const attributesClean = attributesArray.join('');
        document.getElementById('trailPopup').innerHTML = attributesClean;
    }
}

function hoverStateOff() {
    if (hoveredPointId !== null) {
        map.setFeatureState(
            { source: 'paths', id: hoveredPointId },
            { hover: false }
            );
        }
    hoveredStateId = null;
}

function getBufferSize() {
    let currentZoom = map.getZoom();
    if (currentZoom > 8 &&  currentZoom <= 9) {
        return 500;
    } else if (currentZoom > 9 && currentZoom <= 10) {
        return 450;
    } else if (currentZoom > 10 && currentZoom <= 11) {
        return 400;
    } else if (currentZoom > 11 && currentZoom <= 12) {
        return 200;
    } else if (currentZoom > 12 && currentZoom <= 13) {
        return 100;
    } else if (currentZoom > 13 && currentZoom <= 14) {
        return 50;
    } else if (currentZoom > 14 && currentZoom <= 15) {
        return 30;
    } else if (currentZoom > 15 && currentZoom <= 16) {
        return 20;
    } else if (currentZoom > 16 && currentZoom <= 17) {
        return 15;
    }
}