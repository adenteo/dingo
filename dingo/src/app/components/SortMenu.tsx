import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";
import { FaChevronDown } from "react-icons/fa";

interface SortMenuDetails {
    setSortPlacesBy: Dispatch<SetStateAction<string | null>>;
    sortPlacesBy: string | null;
}

const SortMenu = ({ sortPlacesBy, setSortPlacesBy }: SortMenuDetails) => {
    const handleSortingTypeClicked = (item: React.MouseEvent<HTMLElement>) => {
        setSortPlacesBy(item.currentTarget.getAttribute("value"));
    };

    return (
        <div className="flex items-center justify-center mt-3">
            <Menu>
                <MenuButton
                    className="text-black bg-slate-300 text-xs rounded-xl"
                    as={Button}
                    rightIcon={<FaChevronDown />}
                >
                    {sortPlacesBy ? "Sort by: " + sortPlacesBy : "Sort by"}
                </MenuButton>
                <MenuList className="text-black">
                    <MenuItem
                        value={"Detour Distance"}
                        onClick={handleSortingTypeClicked}
                    >
                        Detour Distance
                    </MenuItem>
                    <MenuItem
                        value={"Rating"}
                        onClick={handleSortingTypeClicked}
                    >
                        Rating
                    </MenuItem>
                    <MenuItem
                        value={"Number of Reviews"}
                        onClick={handleSortingTypeClicked}
                    >
                        Number of Reviews
                    </MenuItem>
                </MenuList>
            </Menu>
        </div>
    );
};

export default SortMenu;
