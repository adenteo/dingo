import React, { Dispatch, SetStateAction, useEffect } from "react";
import { BiWalk, BiCar } from "react-icons/bi";
import { BsBicycle } from "react-icons/bs";
import { MdOutlineDirectionsTransitFilled } from "react-icons/md";

interface TransitDetails {
    transitMode: google.maps.TravelMode | null;
    setTransitMode: Dispatch<SetStateAction<google.maps.TravelMode | null>>;
    isLoaded: boolean;
}

const TransitMode = ({transitMode, setTransitMode, isLoaded}: TransitDetails) => {
    const handleIconClick = (mode: google.maps.TravelMode) => {
        setTransitMode(mode);
    };

    useEffect(() => {
      if (isLoaded) {
        setTransitMode(google.maps.TravelMode.DRIVING);
      }
    }, [isLoaded])

    if (!isLoaded) {
      return;
    }

    return (
        <div className="flex justify-between mt-3 mx-6">
            <BiCar
                size={35}
                style={{ color: transitMode === google.maps.TravelMode.DRIVING ? 'green' : 'white' }}
                onClick={() => handleIconClick(google.maps.TravelMode.DRIVING)}
            />
            <MdOutlineDirectionsTransitFilled
                size={35}
                style={{ color: transitMode === google.maps.TravelMode.TRANSIT ? 'green' : 'white' }}
                onClick={() => handleIconClick(google.maps.TravelMode.TRANSIT)}
            />
            <BsBicycle
                size={35}
                style={{ color: transitMode === google.maps.TravelMode.BICYCLING ? 'green' : 'white' }}
                onClick={() => handleIconClick(google.maps.TravelMode.BICYCLING)}
            />
            <BiWalk
                size={35}
                style={{ color: transitMode === google.maps.TravelMode.WALKING ? 'green' : 'white' }}
                onClick={() => handleIconClick(google.maps.TravelMode.WALKING)}
            />
        </div>
    );
};

export default TransitMode;
