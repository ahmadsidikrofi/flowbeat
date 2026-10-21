import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AspectRatio } from "../ui/aspect-ratio"
const ChartSkeleton = () => {
    return (
        <CardContent className='p-0'>
            <AspectRatio ratio={16 / 9} className='m-3'>
                {/* <div className='absolute rounded-2xl inset-0 bg-gradient-to-t from-transparent to-zinc-950/50' /> */}
                <Skeleton className='w-full h-full rounded-2xl inset-0 bg-gradient-to-t from-transparent to-zinc-950/50' />
            </AspectRatio>
        </CardContent>
    );
}

export default ChartSkeleton;