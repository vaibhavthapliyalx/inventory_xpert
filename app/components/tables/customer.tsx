// This file contains the component for the customers table.

// Directive to use client side rendering.
'use client';

// Imports
import React, { Fragment, useEffect, useState } from 'react';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text } from '@tremor/react';
import { ChevronDownIcon, AcademicCapIcon, EnvelopeIcon, MapPinIcon, ShoppingCartIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/solid';
import { Customer,TotalSalesForCustomer } from '../../Shared/Interfaces';
import { MembershipStatus } from '@/app/Shared/Enums';
import ApiConnector from '../../ApiConnector/ApiConnector';

// Grabs the instance of the ApiConnector Class (Singleton) which connects to the backend endpoints.
const apiConnectorInstance = ApiConnector.getInstance();

/**
 * This function renders the customers table.
 * 
 * @param searchParams The search query.
 * @param filter The membership status filter.
 * @returns CustomersTable Component.
 */
export default function CustomersTable({ searchParams, filter }: { searchParams: { q?: string }, filter: string | MembershipStatus }) {
  // State variables.
  const [customers, setCustomers] = useState<Customer[]>();
  const [totalSales, setTotalSales] = useState<TotalSalesForCustomer[]>();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Set up the data to be displayed in the table on initial render.
  useEffect(() => {
    const fetchData = async () => {
      const customers = await apiConnectorInstance.getAllCustomers();
      const totalSales = await apiConnectorInstance.getTotalSalesForEachCustomer();
      
      // Set the data.
      setTotalSales(totalSales);

      // Set the previous orders and products for each customer.
      await setPrevOrdersAndProducts(customers);
    };
    fetchData();
    return function cleanup() {
      setCustomers([]);
    }
  }, []);

 /**
  * This useEffect hook is responsible for fetching and setting the customer data based on the search query and
  * membership status. It allows searching by name or email address. It also fetches the 
  * previous orders and products for each customer.
  */
  useEffect(() => {
    const fetchData = async () => {
      let result;

      // If the filter is not 'All', find the customer by membership status.
      if (filter !== 'All') {
        result = await apiConnectorInstance.findCustomerByMembershipStatus(filter as MembershipStatus);
      } 
      // If the search query includes '@', find the customer by email address.
      else if (searchParams.q?.includes('@')) {
        result = await apiConnectorInstance.findCustomerByEmailAddress(searchParams.q ?? '');
      } 
      // Otherwise, search for the customer by name.
      else {
        result = await apiConnectorInstance.searchCustomerByName(searchParams.q ?? '');
      }

      // If there are no customers, return.
      if (!result) {
        return;
      } else {
        // Set the previous orders and products for each customer.
        await setPrevOrdersAndProducts(result);
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
  }, [searchParams, filter]);


  // Refrenced from StackOverflow: https://stackoverflow.com/questions/76845679/how-do-i-manage-the-complex-state-of-a-list-of-components-nextjs-reactjs
  /**
   * This function is responsible to handle the expansion of a row.
   * 
   * @param customerId The customer ID of the customer whose row is to be expanded.
   */
  function toggleRowExpansion(customerId: number): void{
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

  /**
   * This function returns the total sales of a customer.
   * 
   * @param customerId The customer ID of the customer whose total sales is to be fetched.
   * @returns  The total sales of the customer.
   */
  function getTotalSalesPerCustomer(customerId: number) {
    if (!totalSales) return 0;
    const customerTotalSales = totalSales.find((customer) => customer.customerId === customerId);
    return customerTotalSales?.totalSales ?? 0;
  }

  /**
   * This Asyncronous function is responsible for setting the previous orders and products for each customer.
   * 
   * @param customers The customers whose previous orders and products are to be set.
   * @returns Promise<void>
   */
  async function setPrevOrdersAndProducts(customers: Customer[]): Promise<void>{
    // For each customer, set their previous orders and products.
    // Here, product name is used as the previous order.
    for (const customer of customers) {
      const prevOrderIds = customer.previousOrders;
      const prevOrders = await apiConnectorInstance.findOrdersByOrderIDs(prevOrderIds as number[]);
      const productIds = prevOrders.flatMap((order) => order.products.map((product: any) => product.product_id));
      const products = await apiConnectorInstance.findProductsByProductIDs(productIds as number[]);
      customer.previousOrders = products.map(product => product.name);
    }

    // Set the customers.
    setCustomers(customers);
  }

  /********************** Render Function **********************/
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
          <TableHeaderCell className="p-3">
            <UserIcon className="w-6 h-6 mr-2 inline-block" />
            Total Sales
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
              <TableCell className="p-3">£{getTotalSalesPerCustomer(customer.id)} /-</TableCell>
              <TableCell className="p-3 hidden md:table-cell">{customer.contact.email}</TableCell>
              <TableCell className="p-3 hidden md:table-cell">{customer.contact.phone}</TableCell>
              <TableCell className="p-3 hidden lg:table-cell">{customer.contact.address}</TableCell>
              <TableCell className="p-3">
                <span
                  style={{
                    backgroundColor:
                      customer.membershipStatus === 'Member'
                        ? '#4caf50' // Green
                        : '#f44336', // Red
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