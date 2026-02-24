import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  userId: varchar("user_id").notNull().references(() => users.id), // Owner
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(), // User inputs date
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name"), // Fallback/Quick entry if no customer record created
  product: text("product").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, userId: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true, userId: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true, userId: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Customer = typeof customers.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type Expense = typeof expenses.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// Request types
export type CreateCustomerRequest = InsertCustomer;
export type UpdateCustomerRequest = Partial<InsertCustomer>;

export type CreateSaleRequest = InsertSale;
export type UpdateSaleRequest = Partial<InsertSale>;

export type CreateExpenseRequest = InsertExpense;
export type UpdateExpenseRequest = Partial<InsertExpense>;

// Response types
export type CustomerResponse = Customer;
export type SaleResponse = Sale & { customer?: Customer };
export type ExpenseResponse = Expense;

export const dailySummaries = pgTable("daily_summaries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  totalSales: numeric("total_sales", { precision: 10, scale: 2 }).notNull().default("0"),
  totalExpenses: numeric("total_expenses", { precision: 10, scale: 2 }).notNull().default("0"),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  userId: varchar("user_id").notNull().references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailySummariesRelations = relations(dailySummaries, ({ one }) => ({
  user: one(users, {
    fields: [dailySummaries.userId],
    references: [users.id],
  }),
}));

export const insertDailySummarySchema = createInsertSchema(dailySummaries).omit({ id: true, updatedAt: true, userId: true });
export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertDailySummary = z.infer<typeof insertDailySummarySchema>;

export interface DashboardStats {
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  monthSales: number;
  monthExpenses: number;
  monthProfit: number;
  yearSales: number;
  yearExpenses: number;
  yearProfit: number;
  customerCount: number;
  recentSales: SaleResponse[];
  salesTrend: { date: string; amount: number }[];
}

export interface MonthlyReport {
  month: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  transactionCount: number;
}
