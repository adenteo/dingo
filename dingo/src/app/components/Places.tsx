interface PlacesDetails {
    places: [];
}

const Places = ({ places }: PlacesDetails) => {
    console.log(places);

    const openPlaceGmap = (placeId: string) => {
        window.open("https://www.google.com/maps/place/?q=place_id:" + placeId);
    };
    return (
        <div>
            {places.map((place: any, key) => (
                <div
                    onClick={() => {
                        openPlaceGmap(place.place_id);
                    }}
                    className="p-3 m-3 bg-white text-black rounded w-[80vw] flex"
                    key={key}
                >
                    <img
                        src={place.icon}
                        className="w-14 h-14 rounded my-auto"
                    ></img>
                    <div className="mx-2">
                        <div className="font-semibold">{place.name}</div>
                        {place.rating ? (
                            <div className="relative w-8 h-8 rounded-full bg-green-500 font-bold flex items-center justify-center text-xs">
                                {place.rating}
                            </div>
                        ) : (
                            <div className="text-xs">No Reviews Yet.</div>
                        )}
                        {/* <div className="text-xs">{place.Cuisine}</div>
           <div className="flex">
             <div className="flex m-2">
               <span className="bg-green-400 rounded-xl px-2 py-1 text-xs font-extrabold">+{place.ExtraDistance}</span>
               <span className="text-xs py-1 ml-1 font-extrabold">km</span>
             </div>
             <div className="flex m-2">
               <span className="bg-green-400 rounded-xl px-2 py-1 text-xs font-extrabold">+{place.ExtraTime}</span>
               <span className="text-xs py-1 ml-1 font-extrabold">mins</span>
             </div>
           </div> */}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Places;
