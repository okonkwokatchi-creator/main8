import { Layout } from "@/components/Layout";
import { useSales, useCreateSale, useDeleteSale } from "@/hooks/use-sales";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Search, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertSaleSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Fix schema to handle numeric strings from inputs
const formSchema = insertSaleSchema.extend({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be positive"),
  total: z.coerce.number(), // Will be calc'd automatically
  customerId: z.coerce.number().optional().nullable(),
  date: z.coerce.date()
});

export default function Sales() {
  const { data: sales, isLoading } = useSales();
  const { mutateAsync: createSale } = useCreateSale();
  const { mutateAsync: deleteSale } = useDeleteSale();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = sales?.filter(sale => 
    sale.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteSale(id);
        toast({ title: "Sale deleted", description: "Record removed successfully." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete sale.", variant: "destructive" });
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Sales Management</h1>
          <p className="text-muted-foreground">Track your daily transactions.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search product or customer..." 
              className="pl-9 w-[250px] bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CreateSaleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onCreate={createSale} />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading sales...</TableCell></TableRow>
            ) : filteredSales?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No sales found.</TableCell></TableRow>
            ) : (
              filteredSales?.map((sale) => (
                <TableRow key={sale.id} className="group">
                  <TableCell>{format(new Date(sale.date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{sale.product}</TableCell>
                  <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">${Number(sale.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ${Number(sale.total).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      onClick={() => handleDelete(sale.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}

function CreateSaleDialog({ open, onOpenChange, onCreate }: any) {
  const { data: customers } = useCustomers();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      product: "",
      customerName: "",
      quantity: 1,
      price: 0,
      total: 0,
    },
  });

  // Auto-calc total when qty or price changes
  const qty = form.watch("quantity");
  const price = form.watch("price");
  if (qty && price) {
    const total = qty * price;
    if (form.getValues("total") !== total) {
      form.setValue("total", total);
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Find customer name if ID selected
      if (data.customerId && customers) {
        const customer = customers.find(c => c.id === data.customerId);
        if (customer) data.customerName = customer.name;
      }
      
      await onCreate(data);
      toast({ title: "Success", description: "Sale recorded successfully!" });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create sale.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer (Optional)</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val ? Number(val) : null)} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Walk-in Customer</SelectItem>
                        {customers?.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* If no customer selected, show name input? Skipping for simplicity, assuming Select handles it or defaults to Walk-in */}
            
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product / Service</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Website Design" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                 <Label>Total</Label>
                 <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted flex items-center font-bold">
                   ${(form.watch("quantity") * form.watch("price")).toFixed(2)}
                 </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Recording..." : "Save Sale"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
