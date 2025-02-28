"use client"
import { Brush, CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"

import {
    CardContent,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import ChartSkeleton from "../Skeleton/ChartSkeleton"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
}

export default function VitalSignChart({ VitalSignData, isDataMounted }) {
    const dataLength = VitalSignData.length
    const startIndex = dataLength > 8 ? dataLength - 8 : 0
    const endIndex = dataLength - 1
    return (
        <div>
            {isDataMounted ? (<ChartSkeleton />) : (
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={VitalSignData}
                            margin={{
                                top: 20,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Brush dataKey="date" height={30} stroke="#8884d8" startIndex={startIndex} endIndex={endIndex} />
                            <Line
                                dataKey="bpm"
                                type="natural"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-desktop)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Line>
                            <Line
                                dataKey="spo2"
                                type="natural"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                activeDot={{
                                    r: 6,
                                }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Line>
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            )}
        </div>
    )
}
