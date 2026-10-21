"use client"
import { Brush, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"

import {
    CardContent,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import ChartSkeleton from "../Skeleton/ChartSkeleton"

const chartConfig = {
    SpO2: {
        label: "SpO2 (%)",
        color: "#3b82f6",
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
                            <YAxis
                                domain={[80, 100]}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${value}%`}
                                width={45}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Brush dataKey="date" height={30} stroke="#8884d8" startIndex={startIndex} endIndex={endIndex} />
                            <Line
                                dataKey="SpO2"
                                name="SpO2 (%)"
                                type="natural"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: "#3b82f6" }}
                                activeDot={{ r: 6 }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                    formatter={(value) => `${value}%`}
                                />
                            </Line>
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            )}
        </div>
    )
}
