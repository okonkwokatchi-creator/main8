import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protect all API routes
  // app.use("/api/*", isAuthenticated); // This might conflict with auth routes if not careful. 
  // Better to apply per route or carefully exclude auth routes.
  // Since registerAuthRoutes registers /api/auth/user, checking authentication middleware on /api/* might block login/callback if they are under /api.
  // The blueprint registers /api/login and /api/callback.
  // So we should be careful. 
  // Let's apply isAuthenticated to specific resource routes.

  const requireAuth = isAuthenticated;

  // === Customers ===
  app.get(api.customers.list.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const customers = await storage.getCustomers(userId);
    res.json(customers);
  });

  app.get(api.customers.get.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const customer = await storage.getCustomer(Number(req.params.id));
    // Verify ownership
    if (!customer || customer.userId !== userId) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  });

  app.post(api.customers.create.path, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(userId, input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.customers.update.path, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.customers.update.input.parse(req.body);
      const updated = await storage.updateCustomer(Number(req.params.id), userId, input);
      if (!updated) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.customers.delete.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteCustomer(Number(req.params.id), userId);
    res.status(204).send();
  });

  // === Sales ===
  app.get(api.sales.list.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const sales = await storage.getSales(userId);
    res.json(sales);
  });

  app.post(api.sales.create.path, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Explicitly coerce numeric values before validation
      const body = {
        ...req.body,
        quantity: Number(req.body.quantity),
        price: String(req.body.price),
        total: String(req.body.total),
      };
      const input = api.sales.create.input.parse(body);
      const sale = await storage.createSale(userId, input);
      res.status(201).json(sale);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.sales.update.path, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.sales.update.input.parse(req.body);
      const updated = await storage.updateSale(Number(req.params.id), userId, input);
      if (!updated) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.sales.delete.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteSale(Number(req.params.id), userId);
    res.status(204).send();
  });

  // === Expenses ===
  app.get(api.expenses.list.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const expenses = await storage.getExpenses(userId);
    res.json(expenses);
  });

  app.post(api.expenses.create.path, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Explicitly coerce numeric values
      const body = {
        ...req.body,
        amount: String(req.body.amount),
      };
      const input = api.expenses.create.input.parse(body);
      const expense = await storage.createExpense(userId, input);
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.expenses.update.path, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.expenses.update.input.parse(req.body);
      const updated = await storage.updateExpense(Number(req.params.id), userId, input);
      if (!updated) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.expenses.delete.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteExpense(Number(req.params.id), userId);
    res.status(204).send();
  });

  // === Stats ===
  app.get(api.stats.dashboard.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
  });

  // === Daily Summaries ===
  app.get(api.dailySummaries.list.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    // Basic auto-sync on list if empty to help users with existing data
    const summaries = await storage.getDailySummaries(userId);
    if (summaries.length === 0) {
      await (storage as any).syncAllDailySummaries(userId);
      const updated = await storage.getDailySummaries(userId);
      return res.json(updated);
    }
    res.json(summaries);
  });

  return httpServer;
}
