import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
const CardStatus = ({ title, description, value, icon }) => {
    
    return (
        <Card className="flex flex-col justify-between h-full">
            <CardHeader className="text-left flex-grow">
                <div className="flex justify-between items-center">
                    <CardTitle className="capitalize text-lg font-medium">{title}</CardTitle>
                    {icon}
                </div>
                <p className="text-3xl font-bold">{value}</p>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
        </Card>
    )
}

export default CardStatus;