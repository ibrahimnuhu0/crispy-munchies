import { prisma } from "../../../../lib/prisma";

async function getStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);

  const [
    todayOrders,
    weekOrders,
    monthOrders,
    totalOrders,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfWeek } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        orderStatus: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 3,
    }),
  ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, stock: true },
  });

  const topProductsWithNames = topProducts.map((tp) => ({
    ...tp,
    product: products.find((p) => p.id === tp.productId),
  }));

  return {
    todaySales: todayOrders._sum.totalAmount ?? 0,
    todayCount: todayOrders._count,
    weekSales: weekOrders._sum.totalAmount ?? 0,
    weekCount: weekOrders._count,
    monthSales: monthOrders._sum.totalAmount ?? 0,
    monthCount: monthOrders._count,
    totalOrders,
    recentOrders,
    topProducts: topProductsWithNames,
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-cream/50",
  PREPARING: "text-gold",
  OUT_FOR_DELIVERY: "text-green",
  DELIVERED: "text-cream",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">
          Dashboard
        </h1>
        <p className="mt-1 font-sans text-sm text-cream/60">
          {new Date().toLocaleDateString("en-NG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Today's Sales",
            value: `₦${stats.todaySales.toLocaleString()}`,
            sub: `${stats.todayCount} orders`,
          },
          {
            label: "This Week",
            value: `₦${stats.weekSales.toLocaleString()}`,
            sub: `${stats.weekCount} orders`,
          },
          {
            label: "Monthly Revenue",
            value: `₦${stats.monthSales.toLocaleString()}`,
            sub: `${stats.monthCount} orders`,
          },
          {
            label: "Total Orders",
            value: stats.totalOrders.toString(),
            sub: "all time",
          },
          {
            label: "Best Seller",
            value: stats.topProducts[0]?.product?.name ?? "—",
            sub: `${stats.topProducts[0]?._sum?.quantity ?? 0} units sold`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-surface p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-cream/50">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-gold">
              {stat.value}
            </p>
            <p className="mt-1 font-sans text-xs text-cream/50">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl bg-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-cream">
              Recent Orders
            </h2>
            <a
              href="/admin/orders"
              className="font-mono text-xs text-gold underline-offset-4 hover:underline"
            >
              View all
            </a>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="font-sans text-sm text-cream/50">No orders yet.</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="flex items-center justify-between rounded-xl bg-roast/30 px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-sm text-cream">
                      {order.orderNumber}
                    </p>
                    <p className="font-sans text-xs text-cream/50">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-gold">
                      ₦{order.totalAmount.toLocaleString()}
                    </p>
                    <p
                      className={`font-mono text-[10px] uppercase tracking-widest ${
                        STATUS_COLORS[order.orderStatus] ?? "text-cream/50"
                      }`}
                    >
                      {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-cream">
            Top Products
          </h2>
          <div className="space-y-3">
            {stats.topProducts.map((tp, i) => (
              <div
                key={tp.productId}
                className="flex items-center gap-3 rounded-xl bg-roast/30 px-4 py-3"
              >
                <span className="font-mono text-lg text-gold">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-sans text-sm text-cream">
                    {tp.product?.name ?? "Unknown"}
                  </p>
                  <p className="font-mono text-xs text-cream/50">
                    {tp._sum?.quantity ?? 0} units sold · {tp.product?.stock ?? 0} left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}