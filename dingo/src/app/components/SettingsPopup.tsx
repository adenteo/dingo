import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";

interface SettingsPopupProps {
    isSettingsPopupVisible: boolean;
    setIsSettingsPopupVisible: Dispatch<SetStateAction<boolean>>;
}

const SettingsPopup = ({
    isSettingsPopupVisible,
    setIsSettingsPopupVisible,
}: SettingsPopupProps) => {
    const GoogleAPIKey = localStorage.getItem("Google-API-Key");
    const [apiKey, setApiKey] = useState(GoogleAPIKey ?? "");

    const handleSaveClick = () => {
        console.log("Saving:", apiKey);
        localStorage.setItem("Google-API-Key", apiKey);
        setIsSettingsPopupVisible(false);
    };
    return (
        <Modal
            isOpen={isSettingsPopupVisible}
            onClose={() => {
                setIsSettingsPopupVisible(false);
            }}
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="black">Set your Google API Key</ModalHeader>
                <ModalCloseButton color="black" />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel color="black">Google API Key</FormLabel>
                        <Input
                            value={apiKey}
                            textColor="black"
                            placeholder="Google API Key"
                            onChange={(e) => {
                                setApiKey(e.target.value);
                            }}
                        ></Input>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        bgColor={"green"}
                        textColor={"black"}
                        mr={3}
                        onClick={handleSaveClick}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={() => {
                            const key = localStorage.getItem("Google-API-Key");
                            console.log(key);
                            setIsSettingsPopupVisible(false);
                        }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SettingsPopup;
