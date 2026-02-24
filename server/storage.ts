import { db } from "./db";
import {
  users, customers, sales, expenses,
  dailySummaries,
  type User,
  type Customer, type InsertCustomer,
  type Sale, type InsertSale,
  type Expense, type InsertExpense,
  type DashboardStats,
  type DailySummary,
  type InsertDailySummary
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Auth (already implemented in auth storage, but good to have interface consistency if needed)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { email: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User>;

  // Customers
  getCustomers(userId: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(userId: string, customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, userId: string, update: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number, userId: string): Promise<void>;

  // Sales
  getSales(userId: string): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(userId: string, sale: InsertSale): Promise<Sale>;
  updateSale(id: number, userId: string, update: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number, userId: string): Promise<void>;

  // Expenses
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(userId: string, expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, userId: string, update: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number, userId: string): Promise<void>;

  // Stats
  getDashboardStats(userId: string): Promise<DashboardStats>;

  // Daily Summaries
  getDailySummaries(userId: string): Promise<DailySummary[]>;
  syncDailySummary(userId: string, date: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ... existing methods ...
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(user: { email: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User> {
    const [inserted] = await db.insert(users).values({
      ...user,
      id: sql`gen_random_uuid()`
    }).returning();
    return inserted as User;
  }

  // Customers
  async getCustomers(userId: string): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(userId: string, insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values({ ...insertCustomer, userId }).returning();
    return customer;
  }

  async updateCustomer(id: number, userId: string, update: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set(update)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number, userId: string): Promise<void> {
    await db.delete(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)));
  }

  // Sales
  async getSales(userId: string): Promise<Sale[]> {
    return await db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.date));
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(userId: string, insertSale: InsertSale): Promise<Sale> {
    const saleData = {
      ...insertSale,
      userId,
      quantity: Number(insertSale.quantity),
      price: String(insertSale.price),
      total: String(insertSale.total),
    };
    const [sale] = await db.insert(sales).values(saleData).returning();
    await this.syncDailySummary(userId, insertSale.date);
    return sale;
  }

  async updateSale(id: number, userId: string, update: Partial<InsertSale>): Promise<Sale | undefined> {
    const existing = await this.getSale(id);
    const updateData = { ...update };
    if (update.quantity !== undefined) updateData.quantity = Number(update.quantity);
    if (update.price !== undefined) updateData.price = String(update.price);
    if (update.total !== undefined) updateData.total = String(update.total);

    const [updated] = await db
      .update(sales)
      .set(updateData)
      .where(and(eq(sales.id, id), eq(sales.userId, userId)))
      .returning();
    
    if (updated) {
      await this.syncDailySummary(userId, updated.date);
      if (existing && existing.date !== updated.date) {
        await this.syncDailySummary(userId, existing.date);
      }
    }
    return updated;
  }

  async deleteSale(id: number, userId: string): Promise<void> {
    const existing = await this.getSale(id);
    await db.delete(sales).where(and(eq(sales.id, id), eq(sales.userId, userId)));
    if (existing) {
      await this.syncDailySummary(userId, existing.date);
    }
  }

  // Expenses
  async getExpenses(userId: string): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.date));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(userId: string, insertExpense: InsertExpense): Promise<Expense> {
    const expenseData = {
      ...insertExpense,
      userId,
      amount: String(insertExpense.amount),
    };
    const [expense] = await db.insert(expenses).values(expenseData).returning();
    await this.syncDailySummary(userId, insertExpense.date);
    return expense;
  }

  async updateExpense(id: number, userId: string, update: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existing = await this.getExpense(id);
    const updateData = { ...update };
    if (update.amount !== undefined) updateData.amount = String(update.amount);

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    
    if (updated) {
      await this.syncDailySummary(userId, updated.date);
      if (existing && existing.date !== updated.date) {
        await this.syncDailySummary(userId, existing.date);
      }
    }
    return updated;
  }

  async deleteExpense(id: number, userId: string): Promise<void> {
    const existing = await this.getExpense(id);
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    if (existing) {
      await this.syncDailySummary(userId, existing.date);
    }
  }

  // Daily Summaries
  async getDailySummaries(userId: string): Promise<DailySummary[]> {
    return await db.select().from(dailySummaries).where(eq(dailySummaries.userId, userId)).orderBy(desc(dailySummaries.date));
  }

  async syncDailySummary(userId: string, dateStr: string): Promise<void> {
    const salesRes = await db.select({ value: sql`sum(${sales.total})` })
      .from(sales)
      .where(and(eq(sales.userId, userId), eq(sales.date, dateStr)));
    const totalSales = Number(salesRes[0]?.value) || 0;

    const expensesRes = await db.select({ value: sql`sum(${expenses.amount})` })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.date, dateStr)));
    const totalExpenses = Number(expensesRes[0]?.value) || 0;

    const balance = totalSales - totalExpenses;

    const [existing] = await db.select().from(dailySummaries).where(and(eq(dailySummaries.userId, userId), eq(dailySummaries.date, dateStr)));

    if (existing) {
      await db.update(dailySummaries)
        .set({
          totalSales: String(totalSales),
          totalExpenses: String(totalExpenses),
          balance: String(balance),
          updatedAt: new Date(),
        })
        .where(eq(dailySummaries.id, existing.id));
    } else {
      await db.insert(dailySummaries).values({
        date: dateStr,
        totalSales: String(totalSales),
        totalExpenses: String(totalExpenses),
        balance: String(balance),
        userId,
      });
    }
  }

  // Stats
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    // Today's Sales
    const todaySalesRes = await db.select({ value: sql`sum(${sales.total})` })
      .from(sales)
      .where(and(eq(sales.userId, userId), eq(sales.date, today)));
    const todaySales = Number(todaySalesRes[0]?.value) || 0;

    // Monthly Sales
    const monthSalesRes = await db.select({ value: sql`sum(${sales.total})` })
      .from(sales)
      .where(and(
        eq(sales.userId, userId),
        gte(sales.date, startOfMonth),
        lte(sales.date, endOfMonth)
      ));
    const monthSales = Number(monthSalesRes[0]?.value) || 0;

    // Yearly Sales
    const yearSalesRes = await db.select({ value: sql`sum(${sales.total})` })
      .from(sales)
      .where(and(
        eq(sales.userId, userId),
        gte(sales.date, startOfYear)
      ));
    const yearSales = Number(yearSalesRes[0]?.value) || 0;

    // Monthly Expenses
    const monthExpensesRes = await db.select({ value: sql`sum(${expenses.amount})` })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, startOfMonth),
        lte(expenses.date, endOfMonth)
      ));
    const monthExpenses = Number(monthExpensesRes[0]?.value) || 0;

    // Yearly Expenses
    const yearExpensesRes = await db.select({ value: sql`sum(${expenses.amount})` })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, startOfYear)
      ));
    const yearExpenses = Number(yearExpensesRes[0]?.value) || 0;

    // Daily Expenses
    const todayExpensesRes = await db.select({ value: sql`sum(${expenses.amount})` })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        eq(expenses.date, today)
      ));
    const todayExpenses = Number(todayExpensesRes[0]?.value) || 0;

    // Customer Count
    const customerCountRes = await db.select({ count: sql`count(*)` })
      .from(customers)
      .where(eq(customers.userId, userId));
    const customerCount = Number(customerCountRes[0]?.count) || 0;

    // Recent Sales
    const recentSales = await db.select()
      .from(sales)
      .where(eq(sales.userId, userId))
      .orderBy(desc(sales.date))
      .limit(5);

    // Sales Trend (Last 30 days)
    const salesTrendRes = await db.select({
      date: sales.date,
      amount: sql`sum(${sales.total})`
    })
      .from(sales)
      .where(and(
        eq(sales.userId, userId),
        gte(sales.date, startOfMonth)
      ))
      .groupBy(sales.date)
      .orderBy(sales.date);
      
    // @ts-ignore
    const salesTrend = salesTrendRes.map(s => ({ date: s.date, amount: Number(s.amount) }));

    return {
      todaySales,
      todayExpenses,
      todayProfit: todaySales - todayExpenses,
      monthSales,
      monthExpenses,
      monthProfit: monthSales - monthExpenses,
      yearSales,
      yearExpenses,
      yearProfit: yearSales - yearExpenses,
      customerCount,
      recentSales,
      // @ts-ignore
      salesTrend
    };
  }

  async syncAllDailySummaries(userId: string): Promise<void> {
    const allDatesRes = await db.execute(sql`
      SELECT DISTINCT date FROM (
        SELECT date FROM ${sales} WHERE user_id = ${userId}
        UNION
        SELECT date FROM ${expenses} WHERE user_id = ${userId}
      ) AS all_dates
    `);
    
    for (const row of allDatesRes.rows) {
      await this.syncDailySummary(userId, row.date as string);
    }
  }
}

export const storage = new DatabaseStorage();
