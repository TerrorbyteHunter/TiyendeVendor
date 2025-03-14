import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface RevenueData {
  name: string;
  revenue: number;
}

// Example data - in a real app, this would come from the API
const weeklyData: RevenueData[] = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 6000 },
  { name: 'Wed', revenue: 8000 },
  { name: 'Thu', revenue: 12000 },
  { name: 'Fri', revenue: 7000 },
  { name: 'Sat', revenue: 5000 },
  { name: 'Sun', revenue: 9000 },
];

const monthlyData: RevenueData[] = [
  { name: 'Week 1', revenue: 25000 },
  { name: 'Week 2', revenue: 30000 },
  { name: 'Week 3', revenue: 28000 },
  { name: 'Week 4', revenue: 35000 },
];

const yearlyData: RevenueData[] = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 67000 },
  { name: 'Jul', revenue: 62000 },
  { name: 'Aug', revenue: 75000 },
  { name: 'Sep', revenue: 71000 },
  { name: 'Oct', revenue: 78000 },
  { name: 'Nov', revenue: 83000 },
  { name: 'Dec', revenue: 89000 },
];

type Period = 'week' | 'month' | 'year';

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>('month');
  
  const data = period === 'week' 
    ? weeklyData 
    : period === 'month' 
      ? monthlyData 
      : yearlyData;

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `ZMW ${value / 1000}K`;
    }
    return `ZMW ${value}`;
  };

  const formatTooltipValue = (value: number) => {
    return `ZMW ${value.toLocaleString()}`;
  };
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={period === 'week' ? 'default' : 'outline'}
              onClick={() => setPeriod('week')}
              className="text-xs"
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={period === 'month' ? 'default' : 'outline'}
              onClick={() => setPeriod('month')}
              className="text-xs"
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={period === 'year' ? 'default' : 'outline'}
              onClick={() => setPeriod('year')}
              className="text-xs"
            >
              Year
            </Button>
          </div>
        </div>
        <div className="mt-5 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
