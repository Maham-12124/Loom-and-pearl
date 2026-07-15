import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  orderCount: number;
}

export function UserListTable({ users }: { users: UserListItem[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="text-right">Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
            </TableCell>
            <TableCell>{user.orderCount}</TableCell>
            <TableCell className="text-right text-muted-foreground">
              {user.createdAt.toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
