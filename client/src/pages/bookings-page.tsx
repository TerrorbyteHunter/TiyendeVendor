import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Booking } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BookingDetails } from "@/components/bookings/BookingDetails";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingsPage() {
  const { toast } = useToast();
  const [isViewBookingOpen, setIsViewBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewBookingOpen(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateBookingStatusMutation.mutate({ id, status });
  };

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

  // Filter bookings based on status
  const filteredBookings = bookings?.filter(booking => 
    statusFilter === "all" || booking.status === statusFilter
  ) || [];

  const columns = [
    {
      header: "Booking ID",
      accessorKey: "id",
      cell: (booking: Booking) => <span className="font-medium">#{booking.id}</span>,
    },
    {
      header: "Customer",
      accessorKey: "customerId",
      cell: (booking: Booking) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customerId.toString())}&background=random`} alt="Customer" />
            <AvatarFallback>
              {booking.customerId.toString().substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span>Customer #{booking.customerId}</span>
        </div>
      ),
    },
    {
      header: "Trip",
      accessorKey: "tripId",
      cell: (booking: Booking) => <span>Trip #{booking.tripId}</span>,
    },
    {
      header: "Seat Count",
      accessorKey: "seatCount",
    },
    {
      header: "Total Price",
      accessorKey: "totalPrice",
      cell: (booking: Booking) => <span>ZMW {booking.totalPrice.toFixed(2)}</span>,
    },
    {
      header: "Booking Date",
      accessorKey: "bookingDate",
      cell: (booking: Booking) => format(new Date(booking.bookingDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (booking: Booking) => (
        <Badge variant="outline" className={getStatusColor(booking.status)}>
          {booking.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (booking: Booking) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewBooking(booking)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {booking.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600"
                onClick={() => handleUpdateStatus(booking.id, "confirmed")}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {booking.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600"
              onClick={() => handleUpdateStatus(booking.id, "completed")}
            >
              <Clock className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Count bookings by status
  const countByStatus = {
    all: bookings?.length || 0,
    pending: bookings?.filter(b => b.status === "pending").length || 0,
    confirmed: bookings?.filter(b => b.status === "confirmed").length || 0,
    completed: bookings?.filter(b => b.status === "completed").length || 0,
    cancelled: bookings?.filter(b => b.status === "cancelled").length || 0
  };

  return (
    <DashboardLayout title="Bookings">
      <div className="space-y-6">
        {/* Status cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card 
            className={`cursor-pointer ${statusFilter === "all" ? "border-primary" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">All Bookings</p>
                <p className="text-2xl font-bold">{countByStatus.all}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-full">
                <Eye className="h-5 w-5 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer ${statusFilter === "pending" ? "border-primary" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{countByStatus.pending}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer ${statusFilter === "confirmed" ? "border-primary" : ""}`}
            onClick={() => setStatusFilter("confirmed")}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold">{countByStatus.confirmed}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer ${statusFilter === "cancelled" ? "border-primary" : ""}`}
            onClick={() => setStatusFilter("cancelled")}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold">{countByStatus.cancelled}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Booking Management</CardTitle>
              <CardDescription>
                View and manage customer bookings
              </CardDescription>
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredBookings.length > 0 ? (
              <DataTable data={filteredBookings} columns={columns} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No bookings found</h3>
                <p className="text-muted-foreground mt-2">
                  {statusFilter === "all" 
                    ? "You don't have any bookings yet." 
                    : `You don't have any ${statusFilter} bookings.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Booking Dialog */}
        <Dialog open={isViewBookingOpen} onOpenChange={setIsViewBookingOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                View detailed information about this booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <BookingDetails 
                booking={selectedBooking} 
                onUpdateStatus={handleUpdateStatus} 
                isUpdating={updateBookingStatusMutation.isPending} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
