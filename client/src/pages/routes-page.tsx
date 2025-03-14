import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { Route, InsertRoute } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { RouteForm } from "@/components/routes/RouteForm";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function RoutesPage() {
  const { toast } = useToast();
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isEditRouteOpen, setIsEditRouteOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Fetch routes
  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
  });

  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: async (route: InsertRoute) => {
      const res = await apiRequest("POST", "/api/routes", route);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsAddRouteOpen(false);
      toast({
        title: "Route created",
        description: "The new route has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create route",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update route mutation
  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, route }: { id: number; route: Partial<Route> }) => {
      const res = await apiRequest("PATCH", `/api/routes/${id}`, route);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsEditRouteOpen(false);
      toast({
        title: "Route updated",
        description: "The route has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update route",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete route mutation
  const deleteRouteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsDeleteAlertOpen(false);
      toast({
        title: "Route deleted",
        description: "The route has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete route",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddRoute = (route: InsertRoute) => {
    createRouteMutation.mutate(route);
  };

  const handleEditRoute = (route: Partial<Route>) => {
    if (selectedRoute) {
      updateRouteMutation.mutate({ id: selectedRoute.id, route });
    }
  };

  const handleDeleteRoute = () => {
    if (selectedRoute) {
      deleteRouteMutation.mutate(selectedRoute.id);
    }
  };

  const openEditDialog = (route: Route) => {
    setSelectedRoute(route);
    setIsEditRouteOpen(true);
  };

  const openDeleteDialog = (route: Route) => {
    setSelectedRoute(route);
    setIsDeleteAlertOpen(true);
  };

  const columns = [
    {
      header: "Origin",
      accessorKey: "origin",
    },
    {
      header: "Destination",
      accessorKey: "destination",
    },
    {
      header: "Distance",
      accessorKey: "distance",
      cell: (route: Route) => (
        <span>{route.distance ? `${route.distance} km` : "N/A"}</span>
      ),
    },
    {
      header: "Duration",
      accessorKey: "duration",
      cell: (route: Route) => (
        <span>
          {route.duration
            ? `${(route.duration / 60).toFixed(1)} hours`
            : "N/A"}
        </span>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (route: Route) => <span>ZMW {route.price}</span>,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (route: Route) => (
        <Badge
          variant={route.isActive ? "default" : "secondary"}
          className={route.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {route.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (route: Route) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditDialog(route)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600"
            onClick={() => openDeleteDialog(route)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Routes">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Manage Routes</CardTitle>
              <CardDescription>
                Create, edit, and manage your bus routes
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddRouteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Route
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : routes && routes.length > 0 ? (
              <DataTable data={routes} columns={columns} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No routes found</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  You haven't created any routes yet. Get started by adding your first route.
                </p>
                <Button onClick={() => setIsAddRouteOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Route
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Route Dialog */}
        <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
              <DialogDescription>
                Enter the details for the new bus route
              </DialogDescription>
            </DialogHeader>
            <RouteForm
              onSubmit={handleAddRoute}
              isSubmitting={createRouteMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Route Dialog */}
        <Dialog open={isEditRouteOpen} onOpenChange={setIsEditRouteOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Route</DialogTitle>
              <DialogDescription>
                Update the details for this route
              </DialogDescription>
            </DialogHeader>
            {selectedRoute && (
              <RouteForm
                route={selectedRoute}
                onSubmit={handleEditRoute}
                isSubmitting={updateRouteMutation.isPending}
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
                This will permanently delete the route from{" "}
                {selectedRoute?.origin} to {selectedRoute?.destination}. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteRoute}
                disabled={deleteRouteMutation.isPending}
              >
                {deleteRouteMutation.isPending ? (
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
