import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  percentChange: number;
  icon: ReactNode;
  iconBgColor: string;
}

export function StatCard({ title, value, percentChange, icon, iconBgColor }: StatCardProps) {
  const isPositive = percentChange >= 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3 transition-all duration-300 bg-gradient-to-br from-primary/80 to-primary`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {percentChange !== 0 && (
                  <div 
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? (
                      <ChevronUp className="h-5 w-5 self-center" />
                    ) : (
                      <ChevronDown className="h-5 w-5 self-center" />
                    )}
                    <span className="sr-only">{isPositive ? "Increased" : "Decreased"} by</span>
                    {Math.abs(percentChange)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
