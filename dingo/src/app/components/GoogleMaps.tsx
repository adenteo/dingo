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
    height: "90vh",
};

const center = {
    lat: 1.4545557463846674,
    lng: 103.81565110570433,
};

interface GoogleMapsProps {
    isLoaded: boolean;
    markers: [];
    waypointMarkers: [];
    setMap: Dispatch<SetStateAction<any>>;
    map: any;
    route: any;
}

function GoogleMaps({
    isLoaded,
    markers,
    waypointMarkers,
    setMap,
    map,
    route,
}: GoogleMapsProps) {
    const onLoad = React.useCallback(function callback(map: any) {
        navigator.geolocation.getCurrentPosition((position) => {
            const currLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            const bounds = new window.google.maps.LatLngBounds(currLocation);
            map.fitBounds(bounds);
            setMap(map);
        });
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
            mapContainerStyle={containerStyle}
            onLoad={onLoad}
            onUnmount={onUnmount}
            zoom={10}
        >
            {markers?.map((marker, key) => (
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
                ></MarkerF>
            ))}
            {route && (
                <DirectionsRenderer directions={route}></DirectionsRenderer>
            )}
        </GoogleMap>
    ) : (
        <></>
    );
}

export default React.memo(GoogleMaps);
