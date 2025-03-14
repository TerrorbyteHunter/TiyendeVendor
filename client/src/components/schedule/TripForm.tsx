import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { format, addHours } from "date-fns";
import { insertTripSchema, Trip, Route, Bus } from "@shared/schema";

// Extend the schema to add validation
const formSchema = insertTripSchema
  .omit({ vendorId: true })
  .extend({
    routeId: z.coerce.number().positive("Please select a route."),
    busId: z.coerce.number().positive("Please select a bus."),
    departureTime: z.coerce.date().refine(date => date > new Date(), {
      message: "Departure time must be in the future."
    }),
    arrivalTime: z.coerce.date(),
    availableSeats: z.coerce.number().positive("Available seats must be a positive number."),
    price: z.coerce.number().positive("Price must be a positive number."),
    status: z.string().default("scheduled"),
  }).refine(data => data.arrivalTime > data.departureTime, {
    message: "Arrival time must be after departure time.",
    path: ["arrivalTime"],
  });

type TripFormValues = z.infer<typeof formSchema>;

interface TripFormProps {
  trip?: Trip;
  routes: Route[];
  buses: Bus[];
  onSubmit: (values: TripFormValues) => void;
  isSubmitting: boolean;
  onDelete?: () => void;
}

export function TripForm({ trip, routes, buses, onSubmit, isSubmitting, onDelete }: TripFormProps) {
  // Initialize departure and arrival dates
  const now = new Date();
  const defaultDepartureTime = trip ? new Date(trip.departureTime) : addHours(now, 1);
  const defaultArrivalTime = trip ? new Date(trip.arrivalTime) : addHours(now, 3);

  // Set default values from trip if provided
  const defaultValues: Partial<TripFormValues> = {
    routeId: trip?.routeId || 0,
    busId: trip?.busId || 0,
    departureTime: defaultDepartureTime,
    arrivalTime: defaultArrivalTime,
    availableSeats: trip?.availableSeats || getBusCapacity(trip?.busId),
    price: trip?.price || getRoutePrice(trip?.routeId),
    status: trip?.status || "scheduled",
  };

  const form = useForm<TripFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch for changes to the form values
  const watchedRouteId = form.watch("routeId");
  const watchedBusId = form.watch("busId");

  // Get the price for the selected route
  function getRoutePrice(routeId?: number): number {
    if (!routeId) return 0;
    const route = routes.find(r => r.id === routeId);
    return route?.price || 0;
  }

  // Get the capacity for the selected bus
  function getBusCapacity(busId?: number): number {
    if (!busId) return 0;
    const bus = buses.find(b => b.id === busId);
    return bus?.capacity || 0;
  }

  // Update price when route changes
  const handleRouteChange = (routeId: string) => {
    form.setValue("routeId", parseInt(routeId));
    const price = getRoutePrice(parseInt(routeId));
    if (price) {
      form.setValue("price", price);
    }
  };

  // Update available seats when bus changes
  const handleBusChange = (busId: string) => {
    form.setValue("busId", parseInt(busId));
    const capacity = getBusCapacity(parseInt(busId));
    if (capacity) {
      form.setValue("availableSeats", capacity);
    }
  };

  // Statuses for select menu
  const statuses = [
    { value: "scheduled", label: "Scheduled" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleSubmit = (values: TripFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="routeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route</FormLabel>
                <Select 
                  onValueChange={handleRouteChange} 
                  defaultValue={field.value.toString() || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem 
                        key={route.id} 
                        value={route.id.toString()}
                      >
                        {route.origin} → {route.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="busId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bus</FormLabel>
                <Select 
                  onValueChange={handleBusChange} 
                  defaultValue={field.value.toString() || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bus" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem 
                        key={bus.id} 
                        value={bus.id.toString()}
                      >
                        {bus.name} ({bus.registrationNumber}) - {bus.capacity} seats
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="departureTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Departure Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(field.value);
                          newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                          field.onChange(newDate);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={format(field.value, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arrivalTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Arrival Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(field.value);
                          newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                          field.onChange(newDate);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={format(field.value, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Price (ZMW)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 25.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availableSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Seats</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 45"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem 
                        key={status.value} 
                        value={status.value}
                      >
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          {trip && onDelete && (
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Trip
            </Button>
          )}
          <div className="flex-1 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {trip ? "Updating..." : "Scheduling..."}
                </>
              ) : (
                <>{trip ? "Update Trip" : "Schedule Trip"}</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
