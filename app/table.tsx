import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';

// interface User {
//   name: string;
// }

export default function UsersTable({ users }: { users: any }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Username</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          // <TableRow key={user.id}>
          <TableRow key={user}>
            <TableCell>{user}</TableCell>
            <TableCell>
              {/* <Text>{user.username}</Text> */}
            </TableCell>
            <TableCell>
              {/* <Text>{user.email}</Text> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
