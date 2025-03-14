import { pgTable, text, serial, integer, timestamp, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  companyName: text("company_name"),
  address: text("address"),
  city: text("city"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const routeStops = pgTable("route_stops", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  name: text("name").notNull(),
  distanceFromOrigin: doublePrecision("distance_from_origin").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  distance: doublePrecision("distance"),
  duration: integer("duration"), // duration in minutes
  price: doublePrecision("price").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  hasStops: boolean("has_stops").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number").notNull(),
  capacity: integer("capacity").notNull(),
  type: text("type"), // e.g., Standard, Executive, Luxury
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  routeId: integer("route_id").notNull(),
  busId: integer("bus_id").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  status: text("status").default("scheduled").notNull(), // scheduled, in-progress, completed, cancelled
  availableSeats: integer("available_seats").notNull(),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  customerId: integer("customer_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  seatCount: integer("seat_count").default(1).notNull(),
  status: text("status").default("pending").notNull(), // pending, confirmed, cancelled, completed
  totalPrice: doublePrecision("total_price").notNull(),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, card, mobile money
  status: text("status").default("pending").notNull(), // pending, completed, failed, refunded
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true });
export const insertBusSchema = createInsertSchema(buses).omit({ id: true, createdAt: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

// Types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Bus = typeof buses.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Dashboard stats type
export type DashboardStats = {
  totalPassengers: number;
  activeTrips: number;
  revenue: number;
  bookings: number;
  percentChanges: {
    passengers: number;
    trips: number;
    revenue: number;
    bookings: number;
  };
};
