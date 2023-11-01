"use client";

import { Dispatch, SetStateAction } from "react";
import { Autocomplete } from "@react-google-maps/api";

interface LocationDetails {
    startLocation: any;
    endLocation: any;
    setStartLocation: Dispatch<SetStateAction<any>>;
    setEndLocation: Dispatch<SetStateAction<any>>;
    isLoaded: boolean;
}

const Locations = ({
    startLocation,
    endLocation,
    setStartLocation,
    setEndLocation,
    isLoaded,
}: LocationDetails) => {
    function onStartLoad(autocomplete: any) {
        setStartLocation(autocomplete);
    }

    function onEndLoad(autocomplete: any) {
        setEndLocation(autocomplete);
    }

    function onStartPlaceChanged() {
        if (startLocation != null) {
            const place = startLocation.getPlace();
            const name = place.name;
            const status = place.business_status;
            const formattedAddress = place.formatted_address;
            console.log(`Name: ${name}`);
            console.log(`Business Status: ${status}`);
            console.log(`Formatted Address: ${formattedAddress}`);
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
            console.log(`Name: ${name}`);
            console.log(`Business Status: ${status}`);
            console.log(`Formatted Address: ${formattedAddress}`);
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
            {/* <input className=" m-3 p-3 px-4 rounded-full text-black outline-none text-base" placeholder="Start Point" onChange={(event) => setStartLocation(event.target.value)}></input>
    <input className=" m-3 p-3 px-4 rounded-full text-black outline-none text-base" placeholder="End Destination" onChange={(event) => setEndLocation(event.target.value)}></input> */}
        </div>
    );
};

export default Locations;
