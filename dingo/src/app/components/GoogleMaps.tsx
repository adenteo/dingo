import React from "react";
import {
    DirectionsRenderer,
    DirectionsService,
    GoogleMap,
    Marker,
    MarkerF,
} from "@react-google-maps/api";
import { Dispatch, SetStateAction, useEffect } from "react";

const containerStyle = {
    width: "90vw",
    height: "25vh",
    borderRadius: "0.25rem",
};

interface GoogleMapsProps {
    isLoaded: boolean;
    startEndMarkers: [];
    waypointMarkers: [];
    setMap: Dispatch<SetStateAction<any>>;
    map: any;
    route: any;
    selectedMarker: any;
}

function GoogleMaps({
    isLoaded,
    startEndMarkers,
    waypointMarkers,
    setMap,
    map,
    route,
    selectedMarker
}: GoogleMapsProps) {
    // const onLoad = React.useCallback(function callback(map: any) {
    //     navigator.geolocation.getCurrentPosition((position) => {
    //         const currLocation = {
    //             lat: position.coords.latitude,
    //             lng: position.coords.longitude,
    //         };
    //         const bounds = new window.google.maps.LatLngBounds(currLocation);
    //         map.fitBounds(bounds);
    //         setMap(map);
    //     });
    // }, []);

    const onLoad = React.useCallback(function callback(map: any) {
        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map: any) {
        setMap(null);
    }, []);

    const handleMarkerClick = (lat: any, lng: any) => {
        map?.setZoom(15);
        map?.panTo({ lat, lng });
    };

    return isLoaded ? (
        <GoogleMap
            options={{
                disableDefaultUI: true,
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,
            }}
            mapContainerStyle={containerStyle}
            onLoad={onLoad}
            onUnmount={onUnmount}
            zoom={10}
        >
            {startEndMarkers?.map((marker, key) => (
                <MarkerF
                    position={marker}
                    key={key}
                    onClick={(e) => {
                        handleMarkerClick(e.latLng?.lat(), e.latLng?.lng());
                    }}
                ></MarkerF>
            ))}
            {waypointMarkers?.map((marker, key) => (
                <MarkerF
                    position={marker}
                    key={key}
                    onClick={(e) => {
                        handleMarkerClick(e.latLng?.lat(), e.latLng?.lng());
                    }}
                    opacity={0.4}
                ></MarkerF>
            ))}
            {selectedMarker && <MarkerF position={selectedMarker} zIndex={9999}></MarkerF>}
            {route && (
                <DirectionsRenderer directions={route}></DirectionsRenderer>
            )}
        </GoogleMap>
    ) : (
        <></>
    );
}

export default React.memo(GoogleMaps);
