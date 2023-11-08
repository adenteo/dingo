"use client";

import { Dispatch, SetStateAction } from "react";
import { Autocomplete } from "@react-google-maps/api";

interface LocationDetails {
    startLocation: google.maps.places.Autocomplete | null;
    endLocation: google.maps.places.Autocomplete | null;
    setStartLocation: Dispatch<
        SetStateAction<google.maps.places.Autocomplete | null>
    >;
    setEndLocation: Dispatch<
        SetStateAction<google.maps.places.Autocomplete | null>
    >;
    isLoaded: boolean;
}

const Locations = ({
    startLocation,
    endLocation,
    setStartLocation,
    setEndLocation,
    isLoaded,
}: LocationDetails) => {
    function onStartLoad(autocomplete: google.maps.places.Autocomplete) {
        setStartLocation(autocomplete);
    }

    function onEndLoad(autocomplete: google.maps.places.Autocomplete) {
        setEndLocation(autocomplete);
    }

    function onStartPlaceChanged() {
        if (startLocation != null) {
            const place = startLocation.getPlace();
            const name = place.name;
            const status = place.business_status;
            const formattedAddress = place.formatted_address;
        } else {
            alert("Please enter text");
        }
    }

    function onEndPlaceChanged() {
        if (endLocation != null) {
            const place = endLocation.getPlace();
            const name = place.name;
            const status = place.business_status;
            const formattedAddress = place.formatted_address;
        } else {
            alert("Please enter text");
        }
    }

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col">
            <Autocomplete
                onPlaceChanged={onStartPlaceChanged}
                onLoad={onStartLoad}
            >
                <input
                    className=" m-3 p-3 px-4 rounded-full text-black outline-none text-base"
                    placeholder="Start Point"
                ></input>
            </Autocomplete>
            <Autocomplete onPlaceChanged={onEndPlaceChanged} onLoad={onEndLoad}>
                <input
                    className=" m-3 p-3 px-4 rounded-full text-black outline-none text-base"
                    placeholder="End Destination"
                ></input>
            </Autocomplete>
        </div>
    );
};

export default Locations;
