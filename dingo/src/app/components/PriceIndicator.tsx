import { PriceLevel } from "../../../script/mapUtil";

interface PriceDetails {
    priceLevel: string;
}

const PriceIndicator = ({ priceLevel }: PriceDetails) => {
    const getPriceSigns = (level: string) => {
        switch (level) {
            case PriceLevel.PRICE_LEVEL_INEXPENSIVE:
                return "$";
            case PriceLevel.PRICE_LEVEL_MODERATE:
                return "$$";
            case PriceLevel.PRICE_LEVEL_EXPENSIVE:
                return "$$$";
            case PriceLevel.PRICE_LEVEL_VERY_EXPENSIVE:
                return "$$$$";
            default:
                return "Invalid Price";
        }
    };

    return <div className="mt-2 ml-2 mb-2 text-xs font-semibold bg-green-500 w-fit p-1 px-2 rounded-full">{getPriceSigns(priceLevel)}</div>;
};

export default PriceIndicator;
