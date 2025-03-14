import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertRouteSchema, insertBusSchema, insertTripSchema, insertBookingSchema, insertPaymentSchema } from "@shared/schema";

function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Dashboard stats
  app.get("/api/dashboard/stats", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const stats = await storage.getDashboardStats(vendorId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Routes CRUD
  app.get("/api/routes", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const routes = await storage.getRoutesByVendor(vendorId);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const route = await storage.getRoute(routeId);
      
      if (!route || route.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      res.json(route);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch route" });
    }
  });

  app.post("/api/routes", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const routeData = insertRouteSchema.parse({ ...req.body, vendorId });
      const newRoute = await storage.createRoute(routeData);
      res.status(201).json(newRoute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid route data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create route" });
    }
  });

  app.patch("/api/routes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const route = await storage.getRoute(routeId);
      
      if (!route || route.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      const updatedRoute = await storage.updateRoute(routeId, req.body);
      res.json(updatedRoute);
    } catch (error) {
      res.status(500).json({ message: "Failed to update route" });
    }
  });

  app.delete("/api/routes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const route = await storage.getRoute(routeId);
      
      if (!route || route.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      await storage.deleteRoute(routeId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete route" });
    }
  });

  // Buses CRUD
  app.get("/api/buses", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const buses = await storage.getBusesByVendor(vendorId);
      res.json(buses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buses" });
    }
  });

  app.post("/api/buses", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const busData = insertBusSchema.parse({ ...req.body, vendorId });
      const newBus = await storage.createBus(busData);
      res.status(201).json(newBus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bus data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bus" });
    }
  });

  app.patch("/api/buses/:id", ensureAuthenticated, async (req, res) => {
    try {
      const busId = parseInt(req.params.id);
      const bus = await storage.getBus(busId);
      
      if (!bus || bus.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      const updatedBus = await storage.updateBus(busId, req.body);
      res.json(updatedBus);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bus" });
    }
  });

  app.delete("/api/buses/:id", ensureAuthenticated, async (req, res) => {
    try {
      const busId = parseInt(req.params.id);
      const bus = await storage.getBus(busId);
      
      if (!bus || bus.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      await storage.deleteBus(busId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bus" });
    }
  });

  // Trips CRUD
  app.get("/api/trips", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const trips = await storage.getTripsByVendor(vendorId);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/upcoming", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const trips = await storage.getUpcomingTripsByVendor(vendorId, limit);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming trips" });
    }
  });

  app.post("/api/trips", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const tripData = insertTripSchema.parse({ ...req.body, vendorId });
      const newTrip = await storage.createTrip(tripData);
      res.status(201).json(newTrip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trip data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  app.patch("/api/trips/:id", ensureAuthenticated, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip || trip.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, req.body);
      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  app.delete("/api/trips/:id", ensureAuthenticated, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip || trip.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      await storage.deleteTrip(tripId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });

  // Bookings
  app.get("/api/bookings", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const bookings = await storage.getBookingsByVendor(vendorId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/recent", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const bookings = await storage.getRecentBookingsByVendor(vendorId, limit);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent bookings" });
    }
  });

  app.post("/api/bookings", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const bookingData = insertBookingSchema.parse({ ...req.body, vendorId });
      const newBooking = await storage.createBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/status", ensureAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking || booking.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Payments
  app.get("/api/payments", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const payments = await storage.getPaymentsByVendor(vendorId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      const paymentData = insertPaymentSchema.parse({ ...req.body, vendorId });
      const newPayment = await storage.createPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.patch("/api/payments/:id/status", ensureAuthenticated, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const payment = await storage.getPayment(paymentId);
      
      if (!payment || payment.vendorId !== req.user?.id) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedPayment = await storage.updatePaymentStatus(paymentId, status);
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Vendor profile
  app.get("/api/profile", ensureAuthenticated, (req, res) => {
    const { password, ...vendorWithoutPassword } = req.user as any;
    res.json(vendorWithoutPassword);
  });

  app.patch("/api/profile", ensureAuthenticated, async (req, res) => {
    try {
      const vendorId = req.user?.id;
      
      // Don't allow password update through this endpoint
      const { password, ...updates } = req.body;
      
      const updatedVendor = await storage.updateVendor(vendorId, updates);
      
      if (!updatedVendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      const { password: _, ...vendorWithoutPassword } = updatedVendor;
      res.json(vendorWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
