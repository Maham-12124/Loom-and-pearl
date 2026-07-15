import { prisma } from "@/lib/prisma";
import { UserListTable } from "@/components/admin/UserListTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl">Users</h1>
      <UserListTable
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          orderCount: u._count.orders,
        }))}
      />
    </div>
  );
}
