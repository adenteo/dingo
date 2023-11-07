import { Dispatch, SetStateAction, useEffect } from "react";
import Place from "./Place";

interface PlacesDetails {
    places: google.maps.places.PlaceResult[];
    map: google.maps.Map | null;
    selectedMarker: google.maps.LatLng;
    setSelectedMarker: Dispatch<SetStateAction<google.maps.LatLng>>;
}

const Places = ({ places, map, setSelectedMarker, selectedMarker }: PlacesDetails) => {
    const sortedPlaces = places.sort(
        (a: any, b: any) => b.user_ratings_total - a.user_ratings_total
    );

    return (
        <div className="overflow-auto mt-4">
            {sortedPlaces.map((place, key) => (
                <Place key={key} place={place} map={map} setSelectedMarker={setSelectedMarker} selectedMarker={selectedMarker}/>
            ))}
        </div>
    );
};

export default Places;
