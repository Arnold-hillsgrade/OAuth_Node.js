"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

// Mock data for the usage report
const generateDailyData = (days: number) => {
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    
    return {
      date: date.toISOString().split('T')[0],
      "Purchase Order": Math.floor(Math.random() * 10),
      "Invoice": Math.floor(Math.random() * 15),
      "Quote": Math.floor(Math.random() * 8),
      "Employee Agreement": Math.floor(Math.random() * 5),
      "Contractor Agreement": Math.floor(Math.random() * 3),
      "Xero API Calls": Math.floor(Math.random() * 50),
    };
  });
};

const dateRanges = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
];

const usageData = [
  {
    service: "Purchase Order",
    currentCycle: 45,
    total: 523,
    avgDaily: 8.2,
  },
  {
    service: "Invoice",
    currentCycle: 76,
    total: 892,
    avgDaily: 12.4,
  },
  {
    service: "Quote",
    currentCycle: 21,
    total: 234,
    avgDaily: 5.1,
  },
  {
    service: "Employee Agreement",
    currentCycle: 12,
    total: 156,
    avgDaily: 2.8,
  },
  {
    service: "Contractor Agreement",
    currentCycle: 4,
    total: 37,
    avgDaily: 1.2,
  },
  {
    service: "Xero API Calls",
    currentCycle: 234,
    total: 2892,
    avgDaily: 42.6,
  },
];

const colors = {
  "Purchase Order": "hsl(var(--chart-1))",
  "Invoice": "hsl(var(--chart-2))",
  "Quote": "hsl(var(--chart-3))",
  "Employee Agreement": "hsl(var(--chart-4))",
  "Contractor Agreement": "hsl(var(--chart-5))",
  "Xero API Calls": "#666",
} as const;

type CustomTooltipProps = TooltipProps<ValueType, NameType>;

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label ? new Date(label).toLocaleDateString() : ''}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function UsageReportPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("30");
  const [dailyData, setDailyData] = useState(() => generateDailyData(30));

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setDailyData(generateDailyData(parseInt(value)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workspace
        </Button>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Usage Report</h1>
                <p className="text-muted-foreground">
                  Track usage across all enabled services
                </p>
              </div>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Usage Chart */}
            <div className="h-[500px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={dailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    stroke="hsl(var(--border))"
                    fontSize={12}
                    tickMargin={8}
                    minTickGap={30}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--border))"
                    fontSize={12}
                    tickMargin={8}
                    width={40}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '14px'
                    }}
                  />
                  {Object.entries(colors).map(([key, color]) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Usage Summary Table */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Usage Summary</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Current Cycle</TableHead>
                    <TableHead className="text-right">Total Usage</TableHead>
                    <TableHead className="text-right">Avg. Daily Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageData.map((item) => (
                    <TableRow key={item.service}>
                      <TableCell>{item.service}</TableCell>
                      <TableCell className="text-right">{item.currentCycle}</TableCell>
                      <TableCell className="text-right">{item.total}</TableCell>
                      <TableCell className="text-right">{item.avgDaily}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}