import { Dispatch, SetStateAction, useEffect } from "react";
import Place from "./Place";

interface PlacesDetails {
    places: [];
    map: any;
    selectedMarker: any;
    setSelectedMarker: Dispatch<SetStateAction<any>>;
}

const Places = ({ places, map, setSelectedMarker, selectedMarker }: PlacesDetails) => {
    const sortedPlaces = places.sort(
        (a: any, b: any) => b.user_ratings_total - a.user_ratings_total
    );

    return (
        <div className="overflow-auto mt-4">
            {sortedPlaces.map((place: any, key) => (
                <Place key={key} place={place} map={map} setSelectedMarker={setSelectedMarker} selectedMarker={selectedMarker}/>
            ))}
        </div>
    );
};

export default Places;
