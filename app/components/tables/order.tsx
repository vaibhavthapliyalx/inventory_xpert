// This file contains the component for the orders table.

// Directive to use client side rendering.
'use client';

// Imports
import React, { useState, useEffect} from 'react';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge} from '@tremor/react';
import ApiConnector from '@/app/ApiConnector/ApiConnector';
import { BannerType, OrderStatus, SortOrder } from '@/app/Shared/Enums';
import Banner from '../banner';
import { OrdersWithAllDetails } from '@/app/Shared/Interfaces';

// Grabs the instance of the ApiConnector Class (Singleton) which connects to the backend endpoints.
const apiConnectorInstance = ApiConnector.getInstance();

/**
 * This function renders the orders table.
 * 
 * @param searchParams The search query.
 * @param sortByPrice The sort order.
 * @returns OrdersTable Component.
 */
export default function  OrdersTable({ searchParams, sortByPrice, numProducts }: { searchParams: { q?: string }, sortByPrice?: SortOrder, numProducts: number }) {
  // State variables.
  const [orders, setOrders] = useState<OrdersWithAllDetails[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: BannerType }>({ message: '', type: BannerType.Success });
  
  /**
   * Keeps track of the notification key to re-render the notification component.
   * This is a workaround to re-render the notification component.
   * 
   * Implementation Details:
   * The notification component gets rendered only when the notification state changes.
   * Since the notification state is an object, it does not get re-rendered when the object's properties change.
   * To overcome this, we are using the notificationKey state variable to re-render the notification component.
   * Each time the notification state changes, we increment the notificationKey state variable by 1.
   * Which in turn re-renders the notification component i.e. new instance of the notification component is created.
   * And React handles the garbage collection of the old notification component, so we don't need to remove it from the DOM manually.
   */
  const [notificationKey, setNotificationKey] = useState(0);

  /** 
   * Sets up the data to be displayed in the table.
   */
  useEffect(() => {
    apiConnectorInstance.fetchAllOrdersWithDetails()
    .then((result) => {
      setOrders(result);
    })
    .catch((error) => {
      console.log(error);
    });

  },[]);

  // Sets up the data to be displayed based on number of products.
  // If the number of products is not 0, then fetch the orders with the given number of products.
  // Else fetch all the orders.
  useEffect(() => {
    if(numProducts !== 0) {
      apiConnectorInstance.getOrdersWithNumProducts(numProducts)
      .then((result) => {
        setOrders(result);
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      apiConnectorInstance.fetchAllOrdersWithDetails()
      .then((result) => {
        setOrders(result);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  },[numProducts]);


  /**
   * This function handles the order status change.
   * 
   * @param orderId The order id.
   * @param newStatus The new order status.
   * @returns void.
   */
  function handleOrderStatusChange(orderId: number, newStatus: OrderStatus): void {
    // Updates the order status of the order with the given order id.
    apiConnectorInstance.updateOrderStatus(orderId, newStatus)
    .then((result) => {
      // Updates the order state with the new order status.
      setOrders(orders.map(order => order.id === orderId ? { ...order, orderStatus: newStatus } : order));
      
      // Display the success message.
      setNotification({ message: result.data.message, type: BannerType.Success });

      // Re-render the notification component.
      setNotificationKey(notificationKey + 1);       
    })
    .catch((error) => {
      // Display the error message.
      setNotification({ message: error.message, type: BannerType.Error });

      // Re-render the notification component.
      setNotificationKey(notificationKey + 1);
    });
  }

  /********************** Render Function **********************/
  return (
    <div className="w-full">
      <Table className="w-full border border-gray-300">
        <TableHead>
          <TableRow className="bg-gray-100">
            <TableHeaderCell className="p-3">Order ID</TableHeaderCell>
            <TableHeaderCell className="p-3">Ordered By</TableHeaderCell>
            <TableHeaderCell className="p-3">Products</TableHeaderCell>
            <TableHeaderCell className="p-3">Quantity</TableHeaderCell>
            <TableHeaderCell className="p-3">Total Price</TableHeaderCell>
            <TableHeaderCell className="p-3">Order Date</TableHeaderCell>
            <TableHeaderCell className="p-3">Delivery Status</TableHeaderCell>
            <TableHeaderCell className="p-3">Order Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-gray-50">
              <TableCell className="p-3">{order.id}</TableCell>
              <TableCell className="p-3">{order.customerName}</TableCell>
              <TableCell className="p-3">
                {order.products.map((item: { name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                  <div key={index}>
                    <span>{item.name}</span>
                  </div>
                ))}
              </TableCell>
              <TableCell className="p-3">
              {order.products.map((item, index) => (
                  <div key={index}>
                    <span>{item.quantity}</span>
                  </div>
              ))}
              </TableCell>
              <TableCell className="p-3">£{order.totalPrice} /-</TableCell>
              <TableCell className="p-3">{order.orderDate}</TableCell>
              <TableCell className="p-3">
                <Badge
                  style={{
                    backgroundColor:
                      order.deliveryStatus === 'Delivered'
                        ? '#4caf50' // Green
                        : order.deliveryStatus === 'Shipped'
                        ? '#ff9800' // Orange
                        : '#f44336', // Red
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: '5px',
                  }}
                >
                  {order.deliveryStatus}
                </Badge>
              </TableCell>
              <TableCell className="p-3">
              <select 
                value={order.orderStatus} 
                onChange={e => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                className={`w-25 px-2 py-2 relative mt-0 border border-gray-300 rounded-md ml-2 focus:outline-none focus:ring focus:border focus:ring-indigo-500 align-middle 
                ${order.orderStatus === OrderStatus.Complete ? 'bg-green-200 text-green-700' : 
                order.orderStatus === OrderStatus.InTransit ? 'bg-yellow-200 text-yellow-700' : 
                'bg-blue-200 text-blue-700'}`}
              >
                <option value={OrderStatus.Awaiting}>Awaiting</option>
                <option value={OrderStatus.InTransit}>In Transit</option>
                <option value={OrderStatus.Complete}>Complete</option>
              </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Notification component. */}
      <Banner key={notificationKey} message={notification.message} type={notification.type} />
    </div>
  );
}


