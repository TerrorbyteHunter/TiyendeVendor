import { Booking } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BookingDetailsProps {
  booking: Booking;
  onUpdateStatus: (id: number, status: string) => void;
  isUpdating: boolean;
}

export function BookingDetails({ booking, onUpdateStatus, isUpdating }: BookingDetailsProps) {
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
          <p className="mt-1 text-lg font-medium">#{booking.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <div className="mt-1">
            <Badge variant="outline" className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Customer ID</h3>
          <p className="mt-1">{booking.customerId}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Trip ID</h3>
          <p className="mt-1">{booking.tripId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Seats</h3>
          <p className="mt-1">{booking.seatCount} seat(s)</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Price</h3>
          <p className="mt-1 text-lg font-semibold">ZMW {booking.totalPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Booking Date</h3>
          <p className="mt-1">{format(new Date(booking.bookingDate), "PPP p")}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p className="mt-1">{format(new Date(booking.createdAt), "PPP p")}</p>
        </div>
      </div>

      <Separator />

      {/* Status update actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        {booking.status === "pending" && (
          <>
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onUpdateStatus(booking.id, "confirmed")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Confirm Booking
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onUpdateStatus(booking.id, "cancelled")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Cancel Booking
            </Button>
          </>
        )}
        
        {booking.status === "confirmed" && (
          <Button
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => onUpdateStatus(booking.id, "completed")}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Clock className="mr-2 h-4 w-4" />
            )}
            Mark as Completed
          </Button>
        )}
      </div>
    </div>
  );
}
