import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Eye, CreditCard, DollarSign, Check, X, Clock } from "lucide-react";
import { Payment } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PaymentDetails } from "@/components/payments/PaymentDetails";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function PaymentsPage() {
  const { toast } = useToast();
  const [isViewPaymentOpen, setIsViewPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch payments
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/payments/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      toast({
        title: "Payment updated",
        description: "The payment status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewPaymentOpen(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updatePaymentStatusMutation.mutate({ id, status });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'mobile money':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Filter payments based on status
  const filteredPayments = payments?.filter(payment => 
    statusFilter === "all" || payment.status === statusFilter
  ) || [];

  // Calculate total revenue
  const totalRevenue = payments?.reduce((sum, payment) => {
    if (payment.status === 'completed') {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  // Calculate pending amount
  const pendingAmount = payments?.reduce((sum, payment) => {
    if (payment.status === 'pending') {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  // Count payments by status
  const countByStatus = {
    all: payments?.length || 0,
    pending: payments?.filter(p => p.status === "pending").length || 0,
    completed: payments?.filter(p => p.status === "completed").length || 0,
    failed: payments?.filter(p => p.status === "failed").length || 0,
    refunded: payments?.filter(p => p.status === "refunded").length || 0
  };

  const columns = [
    {
      header: "Payment ID",
      accessorKey: "id",
      cell: (payment: Payment) => <span className="font-medium">#{payment.id}</span>,
    },
    {
      header: "Booking ID",
      accessorKey: "bookingId",
      cell: (payment: Payment) => <span>#{payment.bookingId}</span>,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (payment: Payment) => <span className="font-medium">ZMW {payment.amount.toFixed(2)}</span>,
    },
    {
      header: "Payment Method",
      accessorKey: "paymentMethod",
      cell: (payment: Payment) => (
        <div className="flex items-center">
          {getPaymentMethodIcon(payment.paymentMethod)}
          <span className="ml-2">{payment.paymentMethod}</span>
        </div>
      ),
    },
    {
      header: "Transaction ID",
      accessorKey: "transactionId",
      cell: (payment: Payment) => (
        <span className="text-sm text-gray-600">
          {payment.transactionId || "N/A"}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "paymentDate",
      cell: (payment: Payment) => format(new Date(payment.paymentDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (payment: Payment) => (
        <Badge variant="outline" className={getStatusColor(payment.status)}>
          {payment.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (payment: Payment) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewPayment(payment)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {payment.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600"
                onClick={() => handleUpdateStatus(payment.id, "completed")}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => handleUpdateStatus(payment.id, "failed")}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        {/* Revenue stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900">ZMW {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending Payments</p>
                  <p className="text-3xl font-bold text-yellow-900">ZMW {pendingAmount.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Transaction Count</p>
                  <p className="text-3xl font-bold text-blue-900">{payments?.length || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Payment Management</CardTitle>
              <CardDescription>
                Track and manage payments for bookings
              </CardDescription>
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPayments.length > 0 ? (
              <DataTable data={filteredPayments} columns={columns} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No payments found</h3>
                <p className="text-muted-foreground mt-2">
                  {statusFilter === "all" 
                    ? "You don't have any payments recorded yet." 
                    : `You don't have any ${statusFilter} payments.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Payment Dialog */}
        <Dialog open={isViewPaymentOpen} onOpenChange={setIsViewPaymentOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                View detailed information about this payment
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <PaymentDetails 
                payment={selectedPayment} 
                onUpdateStatus={handleUpdateStatus} 
                isUpdating={updatePaymentStatusMutation.isPending} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
