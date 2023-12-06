import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Place from "./Place";
import mapUtil, { PlacesV2 } from "../../../script/mapUtil";
import { CircularProgress } from "@chakra-ui/react";

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
    const [sortedPlaces, setSortedPlaces] = useState(places.slice(0, 10));
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Set up the Intersection Observer when the component mounts
        const observer = new IntersectionObserver(handleIntersection, {
            root: null, // Use the viewport as the root
            rootMargin: "0px", // No margin
            threshold: 0.1, // Trigger the callback when 10% of the target is visible
        });

        // Observe the target element (observerRef)
        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        // Clean up the Intersection Observer when the component is unmounted
        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [sortedPlaces, isLoading]);

    useEffect(() => {
        if (!sortPlacesBy) {
            return;
        }
        let newSortedPlaces;
        if (sortPlacesBy === "Rating") {
            newSortedPlaces = [...sortedPlaces].sort(
                (a, b) => b.rating - a.rating
            );
        } else if (sortPlacesBy === "Detour Distance") {
            newSortedPlaces = [...sortedPlaces].sort(
                (a, b) => a.detourDistance - b.detourDistance
            );
        } else if (sortPlacesBy === "Number of Reviews") {
            newSortedPlaces = [...sortedPlaces].sort(
                (a, b) => b.userRatingCount - a.userRatingCount
            );
        } else {
            //Default sort by rating
            newSortedPlaces = [...sortedPlaces].sort(
                (a, b) => b.rating - a.rating
            );
        }
        setSortedPlaces(newSortedPlaces);
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [sortPlacesBy]);

    const loadMoreItems = async () => {
        setIsLoading(true);
        // Load the next 10 items and update the sortedPlaces state
        const nextItems = places.slice(
            sortedPlaces.length,
            sortedPlaces.length + 10
        );
        if (nextItems.length == 0) {
            console.log("hi");
            setIsLoading(false);
            return;
        }
        nextItems.forEach(async (item) => {
            if (!item.photoUrl) {
                try {
                    const url = await mapUtil.getPlaceImageUrl(
                        item.photos[0].name
                    );
                    item.photoUrl = url;
                } catch (error) {
                    console.error("Unable to fetch image");
                }
            }
        });
        setSortedPlaces((prevPlaces) => [...prevPlaces, ...nextItems]);
        setIsLoading(false);
    };

    const handleIntersection: IntersectionObserverCallback = (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading) {
            // When the target element (observerRef) becomes visible, load more items
            loadMoreItems();
            console.log("FOUND MORE ITEMS");
        }
    };

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
            {isLoading && (
                <CircularProgress
                    className="flex items-center justify-center"
                    size="1.5em"
                    isIndeterminate
                    color="green.300"
                />
            )}
            <div
                ref={(el) => {
                    if (el) {
                        observerRef.current = el;
                    }
                }}
                style={{ height: "10px" }}
            />
        </div>
    );
};

export default Places;
