import { Dispatch, SetStateAction, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface PlaceDetails {
    place: google.maps.places.PlaceResult,
    map: google.maps.Map | null;
    setSelectedMarker: Dispatch<SetStateAction<google.maps.LatLng>>;
    selectedMarker: google.maps.LatLng;
}

const Place = ({
    place,
    map,
    setSelectedMarker,
    selectedMarker,
}: PlaceDetails) => {
    const handlePlaceClicked = (place: google.maps.places.PlaceResult) => {
        // window.open(
        //     "https://www.google.com/maps/search/?api=1&query=<address>&query_place_id=" +
        //         placeId
        // );
        const markerLatLng = place.geometry?.location
        if (markerLatLng) {
          setSelectedMarker(markerLatLng);
          map?.setZoom(15);
          map?.panTo(markerLatLng);
        }
    };

    const { ref, inView } = useInView({
        /* Optional options */
        threshold: 1, // must be 100% in view.
    });

    useEffect(() => {
        if (inView) {
            handlePlaceClicked(place);
        }
    }, [inView]);

    const isSelectedPlace =
        selectedMarker &&
        selectedMarker.lat() === place.geometry?.location?.lat() &&
        selectedMarker.lng() === place.geometry?.location?.lng();

    return (
        <div
            ref={ref}
            onClick={() => {
                handlePlaceClicked(place);
            }}
            className={`bg-white text-black rounded w-[90vw] flex flex-col mb-10 ${isSelectedPlace && "border-green-700 border-t-8"}`}
        >
            <div className="w-auto h-[20vh]">
                <img
                    src={place.photos?.[0].getUrl()}
                    className="w-full h-full rounded-tl rounded-tr"
                ></img>
            </div>
            {/* <div>{inView ? "true" : "false"}</div> */}
            <div className="mt-2">
                <div className="flex justify-between mx-2">
                    <div className="font-semibold truncate">{place.name}</div>
                    {place.rating ? (
                        <div className="flex">
                            <div className="mx-2 w-6 h-6 rounded-full bg-green-500 font-bold flex items-center justify-center text-xs">
                                {place.rating}
                            </div>
                            <div className="font-semibold text-xs flex items-center justify-center">
                                {`(${place.user_ratings_total})`}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs flex items-center justify-center">
                            No Reviews.
                        </div>
                    )}
                </div>
                <div className="mx-2 mb-2 text-xs truncate">{place.vicinity}</div>
            </div>
        </div>
    );
};

export default Place;
