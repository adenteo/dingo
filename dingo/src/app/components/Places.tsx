import { Dispatch, SetStateAction, useEffect } from "react";
import Place from "./Place";
import mapUtil from "../../../script/mapUtil";

interface PlacesDetails {
    places: google.maps.places.PlaceResult[];
    map: google.maps.Map | null;
    selectedMarker: google.maps.LatLng;
    setSelectedMarker: Dispatch<SetStateAction<google.maps.LatLng>>;
    route: google.maps.DirectionsResult | undefined;
}

const Places = ({
    places,
    map,
    setSelectedMarker,
    selectedMarker,
    route,
}: PlacesDetails) => {
    const sortedPlaces = places.sort(
        (a: any, b: any) => b.user_ratings_total - a.user_ratings_total
    );
    return (
        <div className="overflow-auto mt-4">
            {sortedPlaces.map((place, key) => {
              let shortestDistanceToRoute;
                const placeLocation = place.geometry?.location;
                const routeWaypoints = route?.routes[0].overview_path;
                if (placeLocation && routeWaypoints) {
                    const latLng = {
                        lat: placeLocation.lat(),
                        lng: placeLocation.lng(),
                    };
                    shortestDistanceToRoute =
                        mapUtil.getShortestDistanceToRoute(
                            latLng,
                            routeWaypoints
                        );
                }
                return (
                    <Place
                        key={key}
                        place={place}
                        map={map}
                        setSelectedMarker={setSelectedMarker}
                        selectedMarker={selectedMarker}
                        shortestDistanceToRoute={shortestDistanceToRoute}
                    />
                );
            })}
        </div>
    );
};

export default Places;
