import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FriendProfileManager } from "@/components/account/FriendProfileManager";
import { OrderHistoryList } from "@/components/account/OrderHistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const [profiles, orders] = await Promise.all([
    prisma.friendProfile.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <div>
        <h1 className="font-heading text-3xl">Hello, {session.user.name ?? session.user.email}</h1>
        <p className="text-sm text-muted-foreground">Manage your orders and gift profiles.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-xl">Order History</h2>
        <OrderHistoryList
          orders={orders.map((order) => ({
            id: order.id,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt,
            itemCount: order.items.length,
          }))}
        />
      </section>

      <section className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Design for a Friend</CardTitle>
            <p className="text-sm text-muted-foreground">
              Save named sizing &amp; preference profiles to gift a custom bracelet in seconds.
            </p>
          </CardHeader>
          <CardContent>
            <FriendProfileManager initialProfiles={profiles} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
