import { prisma } from "../../../../lib/prisma";
import { OrderStatusUpdater } from "../../../../components/admin/OrderStatusUpdater";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-cream/10 text-cream/60",
  PREPARING: "bg-gold/15 text-gold",
  OUT_FOR_DELIVERY: "bg-green/15 text-green",
  DELIVERED: "bg-cream/10 text-cream",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Orders</h1>
        <p className="mt-1 font-sans text-sm text-cream/60">
          {orders.length} total orders
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="font-sans text-sm text-cream/60">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-sm font-semibold text-gold">
                    {order.orderNumber}
                  </p>
                  <p className="font-sans text-sm text-cream">
                    {order.customerName}
                  </p>
                  <p className="font-sans text-xs text-cream/50">
                    {order.phone} · {order.city}, {order.state}
                  </p>
                  <p className="font-sans text-xs text-cream/50">
                    {new Date(order.createdAt).toLocaleString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-lg font-semibold text-cream">
                    ₦{order.totalAmount.toLocaleString()}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                      order.paymentStatus === "PAID"
                        ? "bg-green/15 text-green"
                        : order.paymentStatus === "FAILED"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-cream/10 text-cream/60"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-roast/40 px-3 py-1 font-mono text-xs text-cream/70"
                  >
                    {item.product.name} × {item.quantity}
                  </span>
                ))}
              </div>

              <p className="mt-3 font-sans text-xs text-cream/50">
                📍 {order.address}
              </p>

              {order.paymentStatus === "PAID" && (
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest ${
                      STATUS_COLORS[order.orderStatus] ?? "bg-cream/10 text-cream/60"
                    }`}
                  >
                    {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                  </span>
                  <OrderStatusUpdater
                    orderId={order.id}
                    currentStatus={order.orderStatus}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}