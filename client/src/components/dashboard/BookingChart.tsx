import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface BookingData {
  name: string;
  bookings: number;
}

// Example data - in a real app, this would come from the API
const last30DaysData: BookingData[] = [
  { name: 'Mar', bookings: 60 },
  { name: 'Apr', bookings: 75 },
  { name: 'May', bookings: 85 },
  { name: 'Jun', bookings: 70 },
  { name: 'Jul', bookings: 90 },
  { name: 'Aug', bookings: 110 },
  { name: 'Sep', bookings: 95 },
];

const last60DaysData: BookingData[] = [
  { name: 'Feb', bookings: 50 },
  { name: 'Mar', bookings: 60 },
  { name: 'Apr', bookings: 75 },
  { name: 'May', bookings: 85 },
  { name: 'Jun', bookings: 70 },
  { name: 'Jul', bookings: 90 },
  { name: 'Aug', bookings: 110 },
  { name: 'Sep', bookings: 95 },
];

const last90DaysData: BookingData[] = [
  { name: 'Jan', bookings: 40 },
  { name: 'Feb', bookings: 50 },
  { name: 'Mar', bookings: 60 },
  { name: 'Apr', bookings: 75 },
  { name: 'May', bookings: 85 },
  { name: 'Jun', bookings: 70 },
  { name: 'Jul', bookings: 90 },
  { name: 'Aug', bookings: 110 },
  { name: 'Sep', bookings: 95 },
];

type Period = '30' | '60' | '90';

export function BookingChart() {
  const [period, setPeriod] = useState<Period>('30');
  
  const data = period === '30' 
    ? last30DaysData 
    : period === '60' 
      ? last60DaysData 
      : last90DaysData;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Booking Statistics</h3>
          <div className="flex space-x-2">
            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-5 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.1} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
