'use client';
import React, { Fragment, useEffect, useState } from 'react';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text } from '@tremor/react';
import { ChevronDownIcon, AcademicCapIcon, EnvelopeIcon, MapPinIcon, ShoppingCartIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/solid';
import { Customer, MembershipStatus } from '../../interface/CommonInterface';
import CoreConnector from '../../InterfaceAPI/CoreConnector';

export default function CustomersTable({ searchParams, filter }: { searchParams: { q?: string }, filter: string | MembershipStatus }) {
  const [customers, setCustomers] = useState<Customer[]>();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const coreConnectorInstance = CoreConnector.getInstance();

  // Set up the data to be displayed in the table on initial render.
  useEffect(() => {
    const fetchData = async () => {
      const result = await coreConnectorInstance.getAllCustomers();
      setCustomers(result);
    };
    fetchData();
    return function cleanup() {
      setCustomers([]);
    }
  }, []);

/*
This useEffect hook is responsible for fetching and setting the customer data based on the search query, 
membership status, and previous orders. It allows searching by name or email address. It also fetches the 
previous orders and products for each customer.
*/
useEffect(() => {
  const fetchData = async () => {
    let result;

    // If the filter is not 'All', find the customer by membership status.
    if (filter !== 'All') {
      result = await coreConnectorInstance.findCustomerByMembershipStatus(filter as MembershipStatus);
    } 
    // If the search query includes '@', find the customer by email address.
    else if (searchParams.q?.includes('@')) {
      result = await coreConnectorInstance.findCustomerByEmailAddress(searchParams.q ?? '');
    } 
    // Otherwise, search for the customer by name.
    else {
      result = await coreConnectorInstance.searchCustomerByName(searchParams.q ?? '');
    }

    // Set the fetched customers.
    setCustomers(result);

    // If there are no customers, return.
    if(!result) return;

    // For each customer, fetch their previous orders and products.
    for (const customer of result) {
      const prevOrderIds = customer.previousOrders;
      const prevOrders = await coreConnectorInstance.findOrdersByOrderIDs(prevOrderIds as number[]);
      const productIds = prevOrders.flatMap((order) => order.products.map((product: any) => product.product_id));
      const products = await coreConnectorInstance.findProductsByProductIDs(productIds as number[]);
      customer.previousOrders = products.map(product => product.name);
    }
  };

  // If there is a search query or filter is not 'All', call the fetchData function.
  if (searchParams.q !== '' || filter !== 'All') {
    fetchData();
  }

  // Cleanup function to reset the customers when the component unmounts.
  return function cleanup() {
    setCustomers([]);
  }
// The hook runs when the searchParams or filter change.
}, [searchParams, filter]);


  // Refrenced from StackOverflow: https://stackoverflow.com/questions/76845679/how-do-i-manage-the-complex-state-of-a-list-of-components-nextjs-reactjs
  // This function toggles the expansion of a row.
  const toggleRowExpansion = (customerId: number) => {
    setExpandedRows((prevRows) => {
      const newRows = new Set(prevRows);
      if (newRows.has(customerId)) {
        newRows.delete(customerId);
      } else {
        newRows.add(customerId);
      }
      return newRows;
    });
  };


  return (
    <Table className="w-full border border-gray-300">
  <TableHead>
    <TableRow className="bg-gray-100">
      <TableHeaderCell className="p-3">
        <Text className="flex items-center">
          <UserIcon className="w-6 h-6 mr-2 inline-block" />
          Customer ID
        </Text>
      </TableHeaderCell>
      <TableHeaderCell className="p-3">
        <UserIcon className="w-6 h-6 mr-2 inline-block" />
        Name
      </TableHeaderCell>
      <TableHeaderCell className="p-3 hidden md:table-cell">
        <EnvelopeIcon className="w-6 h-6 mr-2 inline-block" />
        Email
      </TableHeaderCell>
      <TableHeaderCell className="p-3 hidden md:table-cell">
        <PhoneIcon className="w-6 h-6 mr-2 inline-block" />
        Phone
      </TableHeaderCell>
      <TableHeaderCell className="p-3 hidden lg:table-cell">
        <MapPinIcon className="w-6 h-6 mr-2 inline-block" />
        Address
      </TableHeaderCell>
      <TableHeaderCell className="p-3">
        <Text className="flex items-center">
          <AcademicCapIcon className="w-6 h-6 mr-2 inline-block" />
          Membership Status
        </Text>
      </TableHeaderCell>
      <TableHeaderCell className="p-3"></TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {customers?.map((customer: Customer) => (
      <Fragment key={customer.id}>
        <TableRow className="hover:bg-gray-50">
          <TableCell className="p-3">{customer.id}</TableCell>
          <TableCell className="p-3">{customer.name}</TableCell>
          <TableCell className="p-3 hidden md:table-cell">{customer.contact.email}</TableCell>
          <TableCell className="p-3 hidden md:table-cell">{customer.contact.phone}</TableCell>
          <TableCell className="p-3 hidden lg:table-cell">{customer.contact.address}</TableCell>
          <TableCell className="p-3">
            <span
              style={{
                backgroundColor:
                  customer.membershipStatus === 'Member'
                    ? '#4caf50' // green
                    : '#f44336', // red
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '5px',
              }}
            >
              {customer.membershipStatus}
            </span>
</TableCell>
          <TableCell
            className="p-3 cursor-pointer"
            onClick={() => toggleRowExpansion(customer.id)}
          >
            <ChevronDownIcon className={`w-5 h-5 ${expandedRows.has(customer.id) ? 'rotate-180' : ''}`} />
          </TableCell>
        </TableRow>
        {expandedRows.has(customer.id) && (
          <TableRow>
            <TableCell colSpan={6} className="p-3">
              <Text className="text-gray-700 font-semibold">
                <ShoppingCartIcon className="w-6 h-6 mr-2 inline-block" />
                Previous Orders
              </Text>
              <ul className="list-disc list-inside ml-6">
                {customer.previousOrders.map((orderId) => (
                  <li key={orderId}>{orderId}</li>
                ))}
              </ul>
              
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    ))}
  </TableBody>
</Table>

  );
}