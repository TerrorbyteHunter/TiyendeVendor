import { vendors, routes, buses, trips, customers, bookings, payments } from "@shared/schema";
import type { 
  Vendor, InsertVendor, 
  Route, InsertRoute, 
  Bus, InsertBus, 
  Trip, InsertTrip, 
  Customer, InsertCustomer, 
  Booking, InsertBooking, 
  Payment, InsertPayment,
  DashboardStats
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Vendors
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByUsername(username: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<Vendor>): Promise<Vendor | undefined>;
  
  // Routes
  getRoute(id: number): Promise<Route | undefined>;
  getRoutesByVendor(vendorId: number): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<Route>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;
  
  // Buses
  getBus(id: number): Promise<Bus | undefined>;
  getBusesByVendor(vendorId: number): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: number, bus: Partial<Bus>): Promise<Bus | undefined>;
  deleteBus(id: number): Promise<boolean>;
  
  // Trips
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByVendor(vendorId: number): Promise<Trip[]>;
  getUpcomingTripsByVendor(vendorId: number, limit?: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByVendor(vendorId: number): Promise<Booking[]>;
  getRecentBookingsByVendor(vendorId: number, limit?: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByVendor(vendorId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Dashboard Statistics
  getDashboardStats(vendorId: number): Promise<DashboardStats>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private vendors: Map<number, Vendor>;
  private routes: Map<number, Route>;
  private buses: Map<number, Bus>;
  private trips: Map<number, Trip>;
  private customers: Map<number, Customer>;
  private bookings: Map<number, Booking>;
  private payments: Map<number, Payment>;
  
  sessionStore: session.SessionStore;
  
  private vendorId: number = 1;
  private routeId: number = 1;
  private busId: number = 1;
  private tripId: number = 1;
  private customerId: number = 1;
  private bookingId: number = 1;
  private paymentId: number = 1;

  constructor() {
    this.vendors = new Map();
    this.routes = new Map();
    this.buses = new Map();
    this.trips = new Map();
    this.customers = new Map();
    this.bookings = new Map();
    this.payments = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize vendor user data
    const johnUser: InsertVendor = {
      username: "John",
      password: "$2b$10$nTqRMgskP5V/hZFDG2QDee/EI6e3UgXN2fE.wSMCA/wYeBUeN0B.e", // hashed "john123"
      name: "John Doe",
      email: "john@tiyende.co.zm",
      phone: "+260977123456",
      companyName: "Power Tools Bus Service",
      address: "45 Independence Ave",
      city: "Lusaka",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    
    this.createVendor(johnUser);
  }

  // Vendor methods
  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUsername(username: string): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(
      vendor => vendor.username === username
    );
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorId++;
    const newVendor: Vendor = { ...vendor, id, createdAt: new Date() };
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...updates };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  // Route methods
  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async getRoutesByVendor(vendorId: number): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(
      route => route.vendorId === vendorId
    );
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const id = this.routeId++;
    const newRoute: Route = { ...route, id, createdAt: new Date() };
    this.routes.set(id, newRoute);
    return newRoute;
  }

  async updateRoute(id: number, updates: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;
    
    const updatedRoute = { ...route, ...updates };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: number): Promise<boolean> {
    return this.routes.delete(id);
  }

  // Bus methods
  async getBus(id: number): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async getBusesByVendor(vendorId: number): Promise<Bus[]> {
    return Array.from(this.buses.values()).filter(
      bus => bus.vendorId === vendorId
    );
  }

  async createBus(bus: InsertBus): Promise<Bus> {
    const id = this.busId++;
    const newBus: Bus = { ...bus, id, createdAt: new Date() };
    this.buses.set(id, newBus);
    return newBus;
  }

  async updateBus(id: number, updates: Partial<Bus>): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (!bus) return undefined;
    
    const updatedBus = { ...bus, ...updates };
    this.buses.set(id, updatedBus);
    return updatedBus;
  }

  async deleteBus(id: number): Promise<boolean> {
    return this.buses.delete(id);
  }

  // Trip methods
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripsByVendor(vendorId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      trip => trip.vendorId === vendorId
    );
  }

  async getUpcomingTripsByVendor(vendorId: number, limit: number = 5): Promise<Trip[]> {
    const now = new Date();
    return Array.from(this.trips.values())
      .filter(trip => trip.vendorId === vendorId && new Date(trip.departureTime) > now)
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
      .slice(0, limit);
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = this.tripId++;
    const newTrip: Trip = { ...trip, id, createdAt: new Date() };
    this.trips.set(id, newTrip);
    return newTrip;
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    
    const updatedTrip = { ...trip, ...updates };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<boolean> {
    return this.trips.delete(id);
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      customer => customer.email === email
    );
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const newCustomer: Customer = { ...customer, id, createdAt: new Date() };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByVendor(vendorId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.vendorId === vendorId
    );
  }

  async getRecentBookingsByVendor(vendorId: number, limit: number = 5): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.vendorId === vendorId)
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, limit);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const newBooking: Booking = { ...booking, id, createdAt: new Date() };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByVendor(vendorId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.vendorId === vendorId
    );
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const newPayment: Payment = { ...payment, id, createdAt: new Date() };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Dashboard Statistics
  async getDashboardStats(vendorId: number): Promise<DashboardStats> {
    // Get all bookings for this vendor
    const vendorBookings = await this.getBookingsByVendor(vendorId);
    
    // Get active trips
    const now = new Date();
    const activeTrips = Array.from(this.trips.values()).filter(
      trip => 
        trip.vendorId === vendorId && 
        new Date(trip.departureTime) <= now && 
        new Date(trip.arrivalTime) >= now
    );
    
    // Calculate total passengers (sum of seat counts from all bookings)
    const totalPassengers = vendorBookings.reduce((sum, booking) => sum + booking.seatCount, 0);
    
    // Calculate total revenue (sum of all completed payment amounts)
    const vendorPayments = Array.from(this.payments.values()).filter(
      payment => payment.vendorId === vendorId && payment.status === 'completed'
    );
    const revenue = vendorPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // For percentage changes, we would typically compare with previous period
    // Here we'll just use some sample values for demonstration
    
    return {
      totalPassengers,
      activeTrips: activeTrips.length,
      revenue,
      bookings: vendorBookings.length,
      percentChanges: {
        passengers: 12,
        trips: 5,
        revenue: 8.2,
        bookings: -2.3
      }
    };
  }
}

export const storage = new MemStorage();
