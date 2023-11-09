interface PriceDetails {
    price_level: number;
}

const PriceIndicator = ({ price_level }: PriceDetails) => {
    const getPriceSigns = (price_level: number) => {
        switch (price_level) {
            case 1:
                return "$";
            case 2:
                return "$$";
            case 3:
                return "$$$";
            case 4:
                return "$$$$";
            default:
                return "Invalid Price";
        }
    };

    return <div className="mt-2 ml-2 mb-2 text-xs font-semibold bg-green-400 w-fit p-1 px-2 rounded-full">{getPriceSigns(price_level)}</div>;
};

export default PriceIndicator;
