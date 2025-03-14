import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { BookingChart } from "@/components/dashboard/BookingChart";
import { TripCard } from "@/components/dashboard/TripCard";
import { Loader2, Users, Clock, DollarSign, BookOpen, Bus, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { DashboardStats, Trip, Booking } from "@shared/schema";
import { format } from "date-fns";

export default function DashboardPage() {
  const { vendor } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch upcoming trips
  const { data: upcomingTrips, isLoading: isLoadingTrips } = useQuery<Trip[]>({
    queryKey: ['/api/trips/upcoming'],
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/recent'],
  });

  const handleViewTripDetails = (tripId: number) => {
    toast({
      title: "Trip Details",
      description: `Viewing details for trip #${tripId}`,
    });
  };

  const handleManageTrip = (tripId: number) => {
    navigate(`/schedule?tripId=${tripId}`);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'en route':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {getGreeting()}, {vendor?.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your transport business today.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <StatCard
              title="Total Passengers"
              value={stats?.totalPassengers || 0}
              percentChange={stats?.percentChanges.passengers || 0}
              icon={<Users className="h-6 w-6 text-white" />}
              iconBgColor="bg-purple-500"
            />
            <StatCard
              title="Active Trips"
              value={stats?.activeTrips || 0}
              percentChange={stats?.percentChanges.trips || 0}
              icon={<Clock className="h-6 w-6 text-white" />}
              iconBgColor="bg-yellow-500"
            />
            <StatCard
              title="Revenue (MTD)"
              value={`ZMW ${stats?.revenue.toLocaleString() || 0}`}
              percentChange={stats?.percentChanges.revenue || 0}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              iconBgColor="bg-green-500"
            />
            <StatCard
              title="Bookings"
              value={stats?.bookings || 0}
              percentChange={stats?.percentChanges.bookings || 0}
              icon={<BookOpen className="h-6 w-6 text-white" />}
              iconBgColor="bg-blue-500"
            />
          </div>
        )}

        {/* Charts & Analytics */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RevenueChart />
          <BookingChart />
        </div>

        {/* Recent Bookings and Trips */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Recent Bookings */}
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Recent Bookings</CardTitle>
              <Button 
                variant="link" 
                onClick={() => navigate('/bookings')}
                className="text-sm font-medium text-primary"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="max-h-80 overflow-y-auto">
                {isLoadingBookings ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentBookings && recentBookings.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customerId.toString())}&background=random`} alt="Customer" />
                                <AvatarFallback>
                                  {booking.customerId.toString().substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900">Customer #{booking.customerId}</div>
                                <div className="text-xs text-gray-500">ZMW {booking.totalPrice.toFixed(2)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Trip #{booking.tripId}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(booking.bookingDate), 'h:mm a')}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent bookings found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Trips */}
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Upcoming Trips</CardTitle>
              <Button 
                variant="link" 
                onClick={() => navigate('/schedule')}
                className="text-sm font-medium text-primary"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="max-h-80 overflow-y-auto">
                {isLoadingTrips ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : upcomingTrips && upcomingTrips.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onViewDetails={handleViewTripDetails}
                        onManageTrip={handleManageTrip}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming trips found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
