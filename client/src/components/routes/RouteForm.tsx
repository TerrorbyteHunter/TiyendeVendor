import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { insertRouteSchema, Route } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { StopsSelector } from "./StopsSelector"; // Added import for StopsSelector


// Extend the schema to add validation
const formSchema = insertRouteSchema
  .omit({ vendorId: true })
  .extend({
    origin: z.string().min(2, "Origin must be at least 2 characters."),
    destination: z.string().min(2, "Destination must be at least 2 characters."),
    price: z.coerce.number().positive("Price must be a positive number."),
    distance: z.coerce.number().positive("Distance must be a positive number.").optional(),
    duration: z.coerce.number().positive("Duration must be a positive number.").optional(),
    isActive: z.boolean().default(true),
    stops: z.array(z.object({ name: z.string(), distanceFromOrigin: z.number() })).optional(),
  });

type RouteFormValues = z.infer<typeof formSchema>;

interface RouteFormProps {
  route?: Route;
  onSubmit: (values: RouteFormValues) => void;
  isSubmitting: boolean;
  suggestedStops?: { name: string; distanceFromOrigin: number }[];
}

export function RouteForm({ route, onSubmit, isSubmitting, suggestedStops }: RouteFormProps) {
  const defaultValues: Partial<RouteFormValues> = {
    origin: route?.origin || "",
    destination: route?.destination || "",
    price: route?.price || 0,
    distance: route?.distance || undefined,
    duration: route?.duration || undefined,
    isActive: route?.isActive !== undefined ? route.isActive : true,
    stops: route?.stops || [],
  };

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (values: RouteFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Lusaka" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ndola" {...field} />
                </FormControl>
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
                <FormLabel>Price (ZMW)</FormLabel>
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
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance (km)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 500"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value));
                    }}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 6"
                    {...field}
                    value={field.value ? (field.value / 60).toString() : ""}
                    onChange={(e) => {
                      const hoursValue = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      if (hoursValue !== undefined && (hoursValue < 0 || !isFinite(hoursValue))) {
                        return;
                      }
                      const minutesValue = hoursValue !== undefined ? Math.round(hoursValue * 60) : undefined;
                      field.onChange(minutesValue);
                    }}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Route</FormLabel>
                <FormDescription>
                  Determines if this route is active and available for booking
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stops"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route Stops</FormLabel>
              <FormControl>
                <StopsSelector 
                  stops={field.value || []} 
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {route ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{route ? "Update Route" : "Create Route"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}


