import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ClockArrowDownIcon, MoreHorizontal } from "lucide-react";

// const delayOptions = [
//     { label: "3 Detik", value: 3000 },
//     { label: "1 Menit", value: 60000 },
//     { label: "5 Menit", value: 300000 },
//     { label: "10 Menit", value: 600000 },
// ]
const delayOptions = [
    { label: "Pilih Device", value: "" },
    { label: "Omron Hem_7142t", value: "omron" },
    { label: "Sensor IoT Max30100", value: "max30100" },
]
const ControlDelayDropdown = ({ onSelect }) => {
    const [selectedDelay, setSelectedDelay] = useState(delayOptions[0]);

    const handleSelect = (option) => {
        setSelectedDelay(option)
        if (option.value !== "") {
            onSelect && onSelect(option.value)
        }
    };

    return (
        <div className="w-1/2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between items-center">
                        {selectedDelay.label} <ClockArrowDownIcon className="h-4 w-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {delayOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            disabled={option.value === ""} // "Pilih Device" tidak bisa diklik lagi
                            className={option.value === "" ? "opacity-70 cursor-not-allowed" : ""}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ControlDelayDropdown;