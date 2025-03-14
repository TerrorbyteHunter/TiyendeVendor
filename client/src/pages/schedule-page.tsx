import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, CalendarIcon, Filter, Loader2, AlertCircle } from "lucide-react";
import { Trip, Route, Bus, InsertTrip } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TripForm } from "@/components/schedule/TripForm";
import { TripCard } from "@/components/dashboard/TripCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, isAfter, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function SchedulePage() {
  const { toast } = useToast();
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [routeFilter, setRouteFilter] = useState<number | undefined>(undefined);

  const [location, setLocation] = useLocation();
  
  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const tripId = params.get('tripId');
    
    if (tripId && !isNaN(Number(tripId))) {
      // Fetch specific trip data when available
      const fetchTrip = async () => {
        try {
          const res = await fetch(`/api/trips/${tripId}`, {
            credentials: 'include',
          });
          if (res.ok) {
            const trip = await res.json();
            setSelectedTrip(trip);
            setIsEditTripOpen(true);
          }
        } catch (error) {
          console.error("Failed to fetch trip:", error);
        }
      };
      
      fetchTrip();
    }
  }, [location]);

  // Fetch trips
  const { data: trips, isLoading: isLoadingTrips } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
  });

  // Fetch routes for dropdown
  const { data: routes, isLoading: isLoadingRoutes } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
  });

  // Fetch buses for dropdown
  const { data: buses, isLoading: isLoadingBuses } = useQuery<Bus[]>({
    queryKey: ['/api/buses'],
  });

  // Create trip mutation
  const createTripMutation = useMutation({
    mutationFn: async (trip: InsertTrip) => {
      const res = await apiRequest("POST", "/api/trips", trip);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips/upcoming'] });
      setIsAddTripOpen(false);
      toast({
        title: "Trip scheduled",
        description: "The new trip has been scheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule trip",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update trip mutation
  const updateTripMutation = useMutation({
    mutationFn: async ({ id, trip }: { id: number; trip: Partial<Trip> }) => {
      const res = await apiRequest("PATCH", `/api/trips/${id}`, trip);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips/upcoming'] });
      setIsEditTripOpen(false);
      toast({
        title: "Trip updated",
        description: "The trip has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update trip",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips/upcoming'] });
      setIsDeleteAlertOpen(false);
      toast({
        title: "Trip deleted",
        description: "The trip has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete trip",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddTrip = (trip: InsertTrip) => {
    createTripMutation.mutate(trip);
  };

  const handleEditTrip = (trip: Partial<Trip>) => {
    if (selectedTrip) {
      updateTripMutation.mutate({ id: selectedTrip.id, trip });
    }
  };

  const handleDeleteTrip = () => {
    if (selectedTrip) {
      deleteTripMutation.mutate(selectedTrip.id);
    }
  };

  const handleViewDetails = (tripId: number) => {
    const trip = trips?.find(t => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setIsEditTripOpen(true);
    }
  };

  const handleManageTrip = (tripId: number) => {
    const trip = trips?.find(t => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setIsEditTripOpen(true);
    }
  };

  const getFilteredTrips = () => {
    if (!trips) return [];
    
    let filtered = [...trips];
    
    // Apply date filter
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.departureTime);
        return tripDate >= startOfDay && tripDate <= endOfDay;
      });
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }
    
    // Apply route filter
    if (routeFilter) {
      filtered = filtered.filter(trip => trip.routeId === routeFilter);
    }
    
    // Sort by departure time (nearest first)
    return filtered.sort((a, b) => {
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });
  };

  // Get trip status based on dates
  const getTripStatus = (trip: Trip): string => {
    const now = new Date();
    const departureTime = new Date(trip.departureTime);
    const arrivalTime = new Date(trip.arrivalTime);
    
    if (trip.status === "cancelled") return "Cancelled";
    if (now > arrivalTime) return "Completed";
    if (now >= departureTime && now <= arrivalTime) return "In-Progress";
    if (isToday(departureTime)) return "Today";
    if (isAfter(departureTime, now)) {
      if (trip.availableSeats <= 5) return "Almost Full";
      if (trip.availableSeats >= 20) return "Low Bookings";
      return "Scheduled";
    }
    
    return trip.status;
  };

  // Enhance trips with route information
  const enhancedTrips = () => {
    const filtered = getFilteredTrips();
    if (!routes) return filtered;
    
    return filtered.map(trip => {
      const route = routes.find(r => r.id === trip.routeId);
      return {
        ...trip,
        route: route ? {
          origin: route.origin,
          destination: route.destination
        } : undefined
      };
    });
  };

  const resetFilters = () => {
    setSelectedDate(undefined);
    setStatusFilter("all");
    setRouteFilter(undefined);
  };

  const isFiltersApplied = selectedDate || statusFilter !== "all" || routeFilter;

  return (
    <DashboardLayout title="Schedule Trips">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Trip Schedule</CardTitle>
              <CardDescription>
                Manage and schedule bus trips for your routes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Route Filter */}
              <Select 
                value={routeFilter?.toString()} 
                onValueChange={(value) => setRouteFilter(value === "all" ? undefined : Number(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routes?.map(route => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.origin} → {route.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {isFiltersApplied && (
                <Button variant="ghost" onClick={resetFilters} size="sm">
                  Clear Filters
                </Button>
              )}

              {/* Add Trip Button */}
              <Button onClick={() => setIsAddTripOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Schedule Trip
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingTrips ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : enhancedTrips().length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {enhancedTrips().map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={{
                      ...trip,
                      status: getTripStatus(trip),
                    }}
                    onViewDetails={handleViewDetails}
                    onManageTrip={handleManageTrip}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No trips found</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  {isFiltersApplied ? 
                    "No trips match your current filters. Try adjusting your filter criteria." : 
                    "You haven't scheduled any trips yet. Get started by scheduling your first trip."}
                </p>
                {isFiltersApplied ? (
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddTripOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Schedule Your First Trip
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Trip Dialog */}
        <Dialog open={isAddTripOpen} onOpenChange={setIsAddTripOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Trip</DialogTitle>
              <DialogDescription>
                Create a new trip by selecting a route, bus and schedule details
              </DialogDescription>
            </DialogHeader>
            {(!isLoadingRoutes && !isLoadingBuses) && (
              <TripForm
                routes={routes || []}
                buses={buses || []}
                onSubmit={handleAddTrip}
                isSubmitting={createTripMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Trip Dialog */}
        <Dialog open={isEditTripOpen} onOpenChange={setIsEditTripOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Trip</DialogTitle>
              <DialogDescription>
                Update the details for this trip
              </DialogDescription>
            </DialogHeader>
            {selectedTrip && !isLoadingRoutes && !isLoadingBuses && (
              <TripForm
                trip={selectedTrip}
                routes={routes || []}
                buses={buses || []}
                onSubmit={handleEditTrip}
                isSubmitting={updateTripMutation.isPending}
                onDelete={() => {
                  setIsEditTripOpen(false);
                  setIsDeleteAlertOpen(true);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this trip and all associated bookings.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteTrip}
                disabled={deleteTripMutation.isPending}
              >
                {deleteTripMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
