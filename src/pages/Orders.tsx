import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Scissors,
  Eye,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const orders = [
  {
    id: "ORD-2024-001",
    item: "Custom Evening Gown",
    tailor: "Isabella Rossi",
    status: "in_production",
    progress: 65,
    date: "Nov 28, 2024",
    expectedDelivery: "Dec 15, 2024",
    price: 450,
  },
  {
    id: "ORD-2024-002",
    item: "Business Suit Set",
    tailor: "Chen Wei Studio",
    status: "shipped",
    progress: 90,
    date: "Nov 20, 2024",
    expectedDelivery: "Dec 5, 2024",
    price: 680,
  },
  {
    id: "ORD-2024-003",
    item: "Traditional Ankara Dress",
    tailor: "Amara Okonkwo",
    status: "completed",
    progress: 100,
    date: "Nov 10, 2024",
    expectedDelivery: "Nov 25, 2024",
    price: 220,
  },
  {
    id: "ORD-2024-004",
    item: "Leather Jacket Custom",
    tailor: "Marcus Johnson",
    status: "pending",
    progress: 10,
    date: "Dec 1, 2024",
    expectedDelivery: "Dec 20, 2024",
    price: 350,
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  in_production: {
    label: "In Production",
    icon: Scissors,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
};

const stats = [
  { label: "Active Orders", value: 2, icon: Package },
  { label: "In Production", value: 1, icon: Scissors },
  { label: "Shipped", value: 1, icon: Truck },
  { label: "Completed", value: 1, icon: CheckCircle },
];

export default function Orders() {
  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Order <span className="text-gradient-gold">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your orders from design to delivery.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
              <Card key={stat.label} variant="glass">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Recent Orders
            </h2>

            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <Card key={order.id} variant="interactive">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-muted-foreground font-mono">
                            {order.id}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                              status.bgColor,
                              status.color
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                          {order.item}
                        </h3>
                        <p className="text-muted-foreground">
                          By <span className="text-foreground">{order.tailor}</span>
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="lg:w-64">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-medium">
                            {order.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="lg:text-right">
                        <div className="text-sm text-muted-foreground">
                          Ordered: {order.date}
                        </div>
                        <div className="text-sm text-foreground">
                          Expected: {order.expectedDelivery}
                        </div>
                        <div className="font-display font-bold text-lg text-gradient-gold mt-1">
                          ${order.price}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Timeline Section */}
          <Card variant="elevated" className="mt-12">
            <CardHeader>
              <CardTitle>Production Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                {/* Timeline Items */}
                <div className="space-y-8">
                  {[
                    { label: "Order Placed", date: "Nov 28, 2024", completed: true },
                    { label: "Design Approved", date: "Nov 29, 2024", completed: true },
                    { label: "Materials Sourced", date: "Dec 2, 2024", completed: true },
                    { label: "Production Started", date: "Dec 3, 2024", completed: true },
                    { label: "Quality Check", date: "Dec 12, 2024", completed: false },
                    { label: "Shipping", date: "Dec 14, 2024", completed: false },
                    { label: "Delivery", date: "Dec 15, 2024", completed: false },
                  ].map((item, index) => (
                    <div key={item.label} className="relative flex gap-4 pl-10">
                      <div
                        className={cn(
                          "absolute left-2 w-4 h-4 rounded-full border-2",
                          item.completed
                            ? "bg-primary border-primary"
                            : "bg-background border-muted-foreground"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.date}</div>
                      </div>
                      {item.completed && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
