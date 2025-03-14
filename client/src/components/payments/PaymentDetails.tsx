import { Payment } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CreditCard, DollarSign, Check, X, RotateCcw, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PaymentDetailsProps {
  payment: Payment;
  onUpdateStatus: (id: number, status: string) => void;
  isUpdating: boolean;
}

export function PaymentDetails({ payment, onUpdateStatus, isUpdating }: PaymentDetailsProps) {
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
        return <CreditCard className="h-5 w-5" />;
      case 'cash':
        return <DollarSign className="h-5 w-5" />;
      case 'mobile money':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Payment ID</h3>
          <p className="mt-1 text-lg font-medium">#{payment.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <div className="mt-1">
            <Badge variant="outline" className={getStatusColor(payment.status)}>
              {payment.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-md flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${
            payment.paymentMethod === 'card' ? 'bg-blue-100' : 
            payment.paymentMethod === 'cash' ? 'bg-green-100' : 'bg-purple-100'
          }`}>
            {getPaymentMethodIcon(payment.paymentMethod)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{payment.paymentMethod}</p>
            {payment.transactionId && (
              <p className="text-xs text-gray-500">Transaction ID: {payment.transactionId}</p>
            )}
          </div>
        </div>
        <p className="text-xl font-bold">ZMW {payment.amount.toFixed(2)}</p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
          <p className="mt-1">#{payment.bookingId}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Vendor ID</h3>
          <p className="mt-1">#{payment.vendorId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
          <p className="mt-1">{format(new Date(payment.paymentDate), "PPP p")}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p className="mt-1">{format(new Date(payment.createdAt), "PPP p")}</p>
        </div>
      </div>

      <Separator />

      {/* Status update actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        {payment.status === "pending" && (
          <>
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onUpdateStatus(payment.id, "completed")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Mark as Completed
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onUpdateStatus(payment.id, "failed")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Mark as Failed
            </Button>
          </>
        )}
        
        {payment.status === "completed" && (
          <Button
            variant="outline"
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={() => onUpdateStatus(payment.id, "refunded")}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Mark as Refunded
          </Button>
        )}
      </div>
    </div>
  );
}
