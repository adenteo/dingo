import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import mapUtil, { PlacesV2 } from "../../../script/mapUtil";
import PriceIndicator from "./PriceIndicator";
import { LuVegan } from "react-icons/lu";
import { Badge } from "@chakra-ui/react";

interface PlaceDetails {
    place: PlacesV2;
    map: google.maps.Map | null;
    setSelectedMarker: Dispatch<
        SetStateAction<google.maps.LatLngLiteral | null>
    >;
    selectedMarker: google.maps.LatLngLiteral | null;
    onAddToTrip: (a: PlacesV2, b: boolean) => number | null;
    tripList: PlacesV2[];
}

const Place = ({
    place,
    map,
    setSelectedMarker,
    selectedMarker,
    onAddToTrip,
    tripList,
}: PlaceDetails) => {
    const [isAdded, setIsAdded] = useState(false);
    const [order, setOrder] = useState<number>(0);

    const handleAddToTrip = () => {
        if (isAdded) {
            // If already added, remove from the list
            onAddToTrip(place, false);
            setIsAdded(false);
            setOrder(0);
        } else {
            // If not added, add to the list
            const order = onAddToTrip(place, true);
            setIsAdded(true);
            if (order) setOrder(order);
        }
    };

    useEffect(() => {
        let newOrder = 1;
        for (const item of tripList) {
            if (item !== place) {
                newOrder += 1;
            } else {
                setOrder(newOrder);
            }
        }
    }, [tripList]);

    const handlePlaceClicked = (place: PlacesV2) => {
        const markerLatLng = {
            lat: place.location.latitude,
            lng: place.location.longitude,
        };
        if (markerLatLng) {
            setSelectedMarker(markerLatLng);
            map?.setZoom(15);
            map?.panTo(markerLatLng);
        }
    };

    const handlePlaceTitleClicked = () => {
        window.open(place.googleMapsUri);
    };

    const { ref, inView } = useInView({
        /* Optional options */
        threshold: 0.7, // must be 100% in view.
    });

    useEffect(() => {
        if (inView) {
            handlePlaceClicked(place);
        }
    }, [inView]);

    const isSelectedPlace =
        selectedMarker &&
        selectedMarker.lat === place.location.latitude &&
        selectedMarker.lng === place.location.longitude;

    const shortestDistanceToRouteFormatted = mapUtil.formatDistance(
        place.detourDistance
    );

    return (
        <div
            ref={ref}
            onClick={() => {
                handlePlaceClicked(place);
            }}
            className={`bg-white text-black rounded w-[90vw] flex flex-col mb-10 ${
                isSelectedPlace && "border-slate-500 border-t-4"
            }`}
        >
            <div className="w-auto h-[20vh] relative">
                {place.photoUrl && (
                    <img src={place.photoUrl} className="w-full h-full"></img>
                )}
                <div
                    className={`absolute top-4 right-2 text-xs rounded-full ${
                        isAdded
                            ? "bg-green-500 text-black w-8 h-8 border-white border-2 justify-center flex items-center font-bold"
                            : "bg-gray-800 text-white p-2 font-semibold"
                    }`}
                    onClick={handleAddToTrip}
                >
                    {isAdded ? order : "Add to Trip"}
                </div>
            </div>
            {/* <div>{inView ? "true" : "false"}</div> */}
            <div className="mt-2">
                <div className="flex justify-between mx-2">
                    <div
                        onClick={handlePlaceTitleClicked}
                        className="font-bold truncate hover:text-green-500 hover:cursor-pointer"
                    >
                        {place.displayName.text}
                    </div>
                    {place.rating ? (
                        <div className="flex">
                            <div className="mx-2 w-6 h-6 rounded-full bg-green-500 font-bold flex items-center justify-center text-xs">
                                {place.rating}
                            </div>
                            <div className="font-semibold text-xs flex items-center justify-center">
                                {`(${place.userRatingCount})`}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs flex items-center justify-center">
                            No Reviews.
                        </div>
                    )}
                </div>
                {place.primaryType && (
                    <div className="text-xs font-semibold mx-2">
                        {mapUtil.formatPrimaryType(place.primaryType)}
                    </div>
                )}
                {place.currentOpeningHours?.openNow ? (
                    <Badge variant="solid" colorScheme="green" className="mx-2">
                        Open
                    </Badge>
                ) : (
                    <Badge
                        variant="solid"
                        colorScheme="red"
                        className="mx-2 text-xs"
                    >
                        Closed
                    </Badge>
                )}
                {place.editorialSummary && (
                    <div className="text-xs mx-2 my-2">
                        {place.editorialSummary.text}
                    </div>
                )}
                <div className="flex">
                    {place.priceLevel && (
                        <PriceIndicator priceLevel={place.priceLevel} />
                    )}
                    {shortestDistanceToRouteFormatted && (
                        <div className="mt-2 mx-2 mb-2 text-xs font-semibold bg-slate-300 w-fit p-1 rounded-full ">
                            ~ {shortestDistanceToRouteFormatted}
                        </div>
                    )}
                    {place.servesVegetarianFood && (
                        <div className="bg-green-700 mt-2 mb-2 text-xs font-semibold w-fit p-1 rounded-full">
                            <LuVegan size={15} />
                        </div>
                    )}
                </div>
                <div className="mx-2 mb-2 text-xs truncate">
                    {place.formattedAddress}
                </div>
                {/* <div className="mx-2 mb-2 text-xs p-2 bg-green-500 rounded-xl">
                    Add to trip
                </div> */}
            </div>
        </div>
    );
};

export default Place;
