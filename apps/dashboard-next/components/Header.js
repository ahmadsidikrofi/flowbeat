import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const Header = ({ leftTitle, rightTitle, description, icon, centerSlot }) => {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <div className="shrink-0">
              <CardTitle className="text-3xl text-blue-500">{leftTitle}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>

            {/* Slot tengah: opsional (misal: search input) */}
            {centerSlot && (
              <div className="flex-1 max-w-sm">
                {centerSlot}
              </div>
            )}

            <div className="flex items-center max-sm:hidden shrink-0">
              <p className="text-blue-600">{icon}</p>
              <CardTitle className="ml-2 text-xl text-blue-600">{rightTitle}</CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
}

export default Header;