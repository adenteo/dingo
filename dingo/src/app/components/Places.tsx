import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Place from "./Place";
import { PlacesV2 } from "../../../script/mapUtil";

interface PlacesDetails {
    places: PlacesV2[];
    map: google.maps.Map | null;
    selectedMarker: google.maps.LatLngLiteral | null;
    setSelectedMarker: Dispatch<
        SetStateAction<google.maps.LatLngLiteral | null>
    >;
    route: google.maps.DirectionsResult | undefined;
    onAddToTrip: (a: PlacesV2, b: boolean) => number | null;
    tripList: PlacesV2[];
    sortPlacesBy: string | null;
}

const Places = ({
    places,
    map,
    setSelectedMarker,
    selectedMarker,
    onAddToTrip,
    tripList,
    sortPlacesBy,
}: PlacesDetails) => {
    const [sortedPlaces, setSortedPlaces] = useState(places);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!sortPlacesBy) {
            return;
        }
        let newSortedPlaces;
        if (sortPlacesBy === "Rating") {
            newSortedPlaces = [...places].sort((a, b) => b.rating - a.rating);
        } else if (sortPlacesBy === "Detour Distance") {
            newSortedPlaces = [...places].sort(
                (a, b) => a.detourDistance - b.detourDistance
            );
        } else if (sortPlacesBy === "Number of Reviews") {
            newSortedPlaces = [...places].sort(
                (a, b) => b.userRatingCount - a.userRatingCount
            );
        } else { //Default sort by rating
          newSortedPlaces = [...places].sort((a, b) => b.rating - a.rating);
        }
        setSortedPlaces(newSortedPlaces);
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
        
    }, [sortPlacesBy]);

    return (
        <div className="overflow-auto" ref={containerRef}>
            {sortedPlaces.map((place, key) => {
                return (
                    <Place
                        key={key}
                        place={place}
                        map={map}
                        setSelectedMarker={setSelectedMarker}
                        selectedMarker={selectedMarker}
                        onAddToTrip={onAddToTrip}
                        tripList={tripList}
                    />
                );
            })}
        </div>
    );
};

export default Places;
