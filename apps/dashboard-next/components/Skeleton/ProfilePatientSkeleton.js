import { AspectRatio } from "../ui/aspect-ratio";
import { CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const ProfilePatientSkeleton = () => {
    return (
        <CardContent className='p-0'>
            <AspectRatio ratio={16 / 30} className='m-3'>
                <Skeleton className='w-full h-full rounded-2xl inset-0 bg-gradient-to-t from-transparent to-zinc-950/50' />
            </AspectRatio>
        </CardContent>
    );
}

export default ProfilePatientSkeleton;