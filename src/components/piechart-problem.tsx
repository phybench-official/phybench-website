"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { TrendingUp, Gauge, Users, ClipboardList, ChartPie, BarChart2 } from "lucide-react"
import { Label, Pie, PieChart, Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { NumberTicker } from "./ui/number-ticker"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { fetchProblemStats, fetchLastWeekProblems } from "@/lib/actions"

// 映射标签名称
const tagLabels = {
  MECHANICS: "力学",
  ELECTRICITY: "电磁学",
  THERMODYNAMICS: "热学",
  OPTICS: "光学",
  MODERN: "近代物理",
  ADVANCED: "四大力学及以上",
  OTHER: "其他"
}

// 颜色配置
const chartConfig = {
  count: {
    label: "题目数量",
  },
  MECHANICS: {
    label: "力学",
    color: "hsl(var(--chart-1))",
  },
  ELECTRICITY: {
    label: "电磁学",
    color: "hsl(var(--chart-2))",
  },
  THERMODYNAMICS: {
    label: "热学",
    color: "hsl(var(--chart-3))",
  },
  OPTICS: {
    label: "光学",
    color: "hsl(var(--chart-4))",
  },
  MODERN: {
    label: "近代物理",
    color: "hsl(var(--chart-5))",
  },
  ADVANCED: {
    label: "四大力学及以上",
    color: "hsl(var(--chart-6))",
  },
  OTHER: {
    label: "其他",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig

// 定义颜色数组
const tagColors = [
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#a4de6c",
  "#d0ed57"
]

// 新增柱状图配置
const barChartConfig = {
  count: {
    label: "题目数量",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function PieChartProblem() {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<Array<{tag: string, count: number, fill: string}>>([])
  const [totalProblems, setTotalProblems] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [pendingProblems, setPendingProblems] = useState(0)
  const [weekData, setWeekData] = useState<Array<{date: string, count: number}>>([])
  const [weeklyChange, setWeeklyChange] = useState<string>("0.0")
  const [totalThisWeek, setTotalThisWeek] = useState(0)

  useEffect(() => {
    const getStats = async () => {
      setLoading(true)
      const [statsData, weekData] = await Promise.all([
        fetchProblemStats(),
        fetchLastWeekProblems()
      ])
      
      if (statsData.success) {
        // 转换数据格式以适应饼图
        const formattedData = statsData.tagStats?.map((item, index) => ({
          tag: item.tag,
          count: item.count,
          fill: tagColors[index % tagColors.length]
        }))
        setChartData(formattedData || [])
        setTotalProblems(statsData.totalProblems || 0)
        setTotalUsers(statsData.totalUsers || 0)
        setPendingProblems(statsData.pendingProblems || 0)
      }
      
      if (weekData.success) {
        setWeekData(weekData.weekData || [])
        setWeeklyChange(weekData.weeklyChange || "0.0")
        setTotalThisWeek(weekData.totalThisWeek || 0)
      }
      
      setLoading(false)
    }
    
    getStats()
  }, [])

  return (
    <div className="px-6 md:px-8 xl:px-24">
      <Card className="flex flex-col">
        <CardHeader className="items-start pb-0">
          <CardTitle className="text-xl flex flex-row items-center">
            <Gauge className="mr-2 h-6 w-6" />
            数据看板
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0 grid md:grid-cols-3 md:gap-4 grid-cols-1 gap-8">
          {/* 类别饼状图 */}
          <div className="flex flex-col justify-center items-center space-y-4">
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full aspect-square max-h-[250px] 2xl:min-w-md"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="tag"
                innerRadius={60}
                strokeWidth={5}
                labelLine={false}
                label={({tag, percent}) => `${tagLabels[tag as keyof typeof tagLabels]}: ${(percent * 100).toFixed(0)}%`}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {loading ? "加载中..." : totalProblems.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            总题数
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
            <h2 className=" font-medium flex items-center mb-2">
              <ChartPie className="h-4 w-4 mr-2" />
              各类别题目数量
            </h2>
          </div>
          
          <div className="flex flex-col justify-center items-center space-y-4">
            {/* 当前总用户数 */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2" />
                <span className="text-lg font-medium">当前用户总数</span>
              </div>
              {loading ? (
                <div className="text-2xl font-medium">Loading...</div>
              ) : (
                <NumberTicker
                  value={totalUsers}
                  className="whitespace-pre-wrap text-5xl font-semibold tracking-tighter"
                />
              )}
            </div>
            {/* 待审核题目数量 */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center mb-2">
                <ClipboardList className="h-5 w-5 mr-2" />
                <span className="text-lg font-medium">待审核题目</span>
              </div>
              {loading ? (
                <div className="text-2xl font-medium">Loading...</div>
              ) : (
                <NumberTicker
                  value={pendingProblems}
                  className="whitespace-pre-wrap text-5xl font-semibold tracking-tighter"
                />
              )}
            </div>
          </div>
          
          {/* 过去一周新增题目 */}
          <div className="flex flex-col justify-center items-center space-y-4">
            <ChartContainer
              config={barChartConfig}
              className="mx-auto w-full h-[250px]"
            >
              <BarChart
                accessibilityLayer
                data={weekData}
                margin={{
                  top: 20,
                  right: 15,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" fill="hsl(221.2 83.2% 53.3%)" radius={4}>
                  <LabelList
                    position="top"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            <h2 className="font-medium flex items-center mb-2">
              <BarChart2 className="h-4 w-4 mr-2" />
              过去七天新增题目：{totalThisWeek} 题
            </h2>
            <div className="flex items-center gap-2 font-medium leading-none">
              {Number(weeklyChange) > 0 ? 
                `周环比上涨 ${weeklyChange}%` : 
                Number(weeklyChange) < 0 ? 
                  `周环比下降 ${Math.abs(Number(weeklyChange))}%` : 
                  `周环比持平`} 
              <TrendingUp className={`h-4 w-4 ${Number(weeklyChange) < 0 ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            上次更新时间：{new Date().toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
