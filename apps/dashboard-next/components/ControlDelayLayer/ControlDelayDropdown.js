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
    { label: "Real-time monitoring", value: 3000 },
    { label: "Respon cepat", value: 30000 },
    { label: "Normal monitoring", value: 60000 },
    { label: "Hemat data", value: 300000 },
]
const ControlDelayDropdown = () => {
    const [ selectedDelay, setSelectedDelay ] = useState(delayOptions[1])
    const handleSelect = (option) => {
        setSelectedDelay(option)
        onSelect(option.value)
    }
    return (
        <div className="w-1/2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between items-center">
                        {selectedDelay.label} <ClockArrowDownIcon className="h-4 w-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Pilih Interval</DropdownMenuLabel>
                    {delayOptions.map((option) => (
                        <DropdownMenuItem key={option.value} onClick={() => handleSelect(option)}>
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default ControlDelayDropdown;