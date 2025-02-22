import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const Header = ({ leftTitle, rightTitle, description, icon }) => {
    return (
        // <div className="flex justify-between items-center max-sm:gap-10">
        //     <div className="flex items-start gap-3 text-blue-500">
        //         <Button size="icon" className="rounded-full bg-blue-500">
        //             {icon}
        //         </Button>
        //         <div className="flex flex-col space-y-1">
        //             <h1 className="text-3xl font-semibold">{leftTitle}</h1>
        //             <p className="text-sm text-muted-foreground">{description}</p>
        //         </div>
        //     </div>
        //     <div className="flex items-center">
        //         <h1 className="ml-2 text-md font-medium text-right">{rightTitle}</h1>
        //     </div>
        // </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">{leftTitle}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex items-center">
              {icon}
              <CardTitle className="ml-2 text-xl">{rightTitle}</CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
}

export default Header;