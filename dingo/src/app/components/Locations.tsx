"use client"

import { Dispatch, SetStateAction } from "react";

interface LocationDetails {
  setStartLocation: Dispatch<SetStateAction<string>>
  setEndLocation: Dispatch<SetStateAction<string>>
}

const Locations = ({setStartLocation, setEndLocation}: LocationDetails) => {

  return (
  <div className="flex flex-col">
    <input className=" m-3 p-3 px-4 rounded-full text-black outline-none text-base" placeholder="Start Point" onChange={(event) => setStartLocation(event.target.value)}></input>
    <input className=" m-3 p-3 px-4 rounded-full text-black outline-none text-base" placeholder="End Destination" onChange={(event) => setEndLocation(event.target.value)}></input>
  </div>)
}

export default Locations;