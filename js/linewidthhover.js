let bufferShown = false;
let hoveredPointId =  null;

function addBufferLayer(data) {

    map.addLayer({
        'id': 'bufferLayer',
        'type': 'line',
        'source': 'paths',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#fff',
            'line-width': [
                'interpolate', 
                ['exponential', 2], 
                ['zoom'],
                10,
                30, 
                18,
                10
            ],
            'line-opacity': 0
        }
    }, 'pathsLayer');

    map.on('mousemove', 'bufferLayer', hoverState);
    map.on('mouseleave', 'bufferLayer', hoverStateOff);
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

        const attributes = {
            'OGF_ID': e.features[0].properties.OGF_ID,
            'TRAIL_NAME': e.features[0].properties.TRAIL_NAME,
            'ASSOC': e.features[0].properties.ASSOC
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