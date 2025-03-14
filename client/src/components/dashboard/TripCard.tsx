import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trip } from "@shared/schema";
import { Map, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface TripCardProps {
  trip: Trip & { 
    route?: { origin: string; destination: string } 
  };
  onViewDetails: (tripId: number) => void;
  onManageTrip: (tripId: number) => void;
}

export function TripCard({ trip, onViewDetails, onManageTrip }: TripCardProps) {
  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'booking open':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'low bookings':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format the departure time
  const formattedDate = trip.departureTime 
    ? format(new Date(trip.departureTime), 'MMM dd, yyyy, h:mm a')
    : 'No date set';

  // Get passenger count (available seats vs capacity)
  const passengerCount = trip.availableSeats;

  // Route display
  const routeDisplay = trip.route 
    ? `${trip.route.origin} to ${trip.route.destination}`
    : 'Unknown Route';

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <Map className="h-5 w-5 text-primary" />
            <h4 className="ml-1.5 text-sm font-medium text-gray-900">{routeDisplay}</h4>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{passengerCount} passengers</span>
          </div>
        </div>
        <div>
          <Badge variant="outline" className={getStatusColor(trip.status)}>
            {trip.status}
          </Badge>
        </div>
      </div>
      <div className="mt-3 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(trip.id)}
          className="text-xs"
        >
          Details
        </Button>
        <Button 
          size="sm" 
          onClick={() => onManageTrip(trip.id)}
          className="text-xs"
        >
          Manage Trip
        </Button>
      </div>
    </div>
  );
}
