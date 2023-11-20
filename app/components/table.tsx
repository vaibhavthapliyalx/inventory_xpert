import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';
import { Customer } from '../interface/CommonInterface';
import CoreConnector from '../InterfaceAPI/CoreConnector';

// interface User {
//   name: string;
// }

export default function UsersTable({ customers }: { customers: Customer[] }) {
  
  // CoreConnector.getInstance().getOrdersWithCustomerDetailsForProducts()
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Membership Status</TableHeaderCell>
          <TableHeaderCell>Previous Orders</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {customers.map((customer : Customer) => (
          // <TableRow key={user.id}>
          <TableRow key={customer.id}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>
              <Text>{customer.membershipStatus}</Text>
            </TableCell>
            <TableCell>
              <Text>{customer.previousOrders}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
