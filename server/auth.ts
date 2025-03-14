import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { compare, hash } from "bcrypt";
import { storage } from "./storage";
import { Vendor } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends Vendor {}
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await hash(password, saltRounds);
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await compare(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "tiyende-vendor-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const vendor = await storage.getVendorByUsername(username);
        if (!vendor || !(await comparePasswords(password, vendor.password))) {
          return done(null, false);
        } else {
          return done(null, vendor);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((vendor, done) => done(null, vendor.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const vendor = await storage.getVendor(id);
      done(null, vendor);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingVendor = await storage.getVendorByUsername(req.body.username);
      if (existingVendor) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const vendor = await storage.createVendor({
        ...req.body,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...vendorWithoutPassword } = vendor;

      req.login(vendor, (err) => {
        if (err) return next(err);
        res.status(201).json(vendorWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Remove password from response
    const { password, ...vendorWithoutPassword } = req.user as Vendor;
    res.status(200).json(vendorWithoutPassword);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/vendor", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...vendorWithoutPassword } = req.user as Vendor;
    res.json(vendorWithoutPassword);
  });
}
