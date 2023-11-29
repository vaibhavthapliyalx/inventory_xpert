'use client';
import React, { useState, useEffect} from 'react';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge} from '@tremor/react';
import CoreConnector from '@/app/InterfaceAPI/CoreConnector';
import { BannerType, OrderStatus, SortOrder } from '@/app/interface/CommonInterface';
import { Banner } from '../banner';

const coreConnectorInstance = CoreConnector.getInstance();

export default function  OrdersTable({ searchParams, sortByPrice }: { searchParams: { q?: string }, sortByPrice?: SortOrder }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: BannerType }>({ message: '', type: BannerType.Success });
  
  // Keep track of the notification key to re-render the notification component.
  // This is a workaround to re-render the notification component.
  const [notificationKey, setNotificationKey] = useState(0);

 /** 
  * Set up the data to be displayed in the table.
  * This is causing the data being fetched slower than the table being rendered.
  * ToDo: Find a way to render the table after the data is fetched 
  * OR display a loading screen while the data is being fetched
  * OR Optimize the procedure.(Not Urgent)
  */
  useEffect(() => {
    const fetchData = async () => {
      const result = await coreConnectorInstance.getAllOrders();
      let ordersWithDetails = [];
      for (let order of result) {
        order.orderDate = new Date(order.orderDate).toLocaleDateString();
        const productsWithDetails = await coreConnectorInstance.findProductsByProductIDs(order.products.map((item: { product_id: any; }) => item.product_id));
        const customerName = (await coreConnectorInstance.getCustomerByCustomerID(order.customerId)).name;
        ordersWithDetails.push({ ...order,customerName: customerName, products: productsWithDetails, orderQuantity: order.products.map((item: { quantity: any; }) => item.quantity)});
      }
      console.log(ordersWithDetails);
      setOrders(ordersWithDetails);
    };
    fetchData();
  }, []);



const handleOrderStatusChange = async (orderId: number, newStatus: OrderStatus) => {
  console.log(orderId, newStatus);
  coreConnectorInstance.updateOrderStatus(orderId, newStatus).then((result) => {
    setOrders(orders.map(order => order.id === orderId ? { ...order, orderStatus: newStatus } : order));  
    setNotification({ message: result.data.message, type: BannerType.Success });
    setNotificationKey(notificationKey + 1);       
  })
  .catch((error) => {
    setNotification({ message: error.message, type: BannerType.Error });
    setNotificationKey(notificationKey + 1);
  });
};

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
              {order.orderQuantity.map((item: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined, index: React.Key | null | undefined) => (
                  <div key={index}>
                    <span>{item}</span>
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
                        ? '#4caf50' // green
                        : order.deliveryStatus === 'Shipped'
                        ? '#ff9800' // orange
                        : '#f44336', // red
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
                onChange={e => handleOrderStatusChange(order.id, (e.target as HTMLSelectElement).value as OrderStatus)}
                className={`w-25 px-2 py-2 relative mt-0 border border-gray-300 rounded-md ml-2 focus:outline-none focus:ring focus:border focus:ring-indigo-500 align-middle 
                ${order.orderStatus === OrderStatus.Delivered ? 'bg-green-200 text-green-700' : 
                order.orderStatus === OrderStatus.InTransit ? 'bg-yellow-200 text-yellow-700' : 
                order.orderStatus === OrderStatus.Dispatched ? 'bg-blue-200 text-blue-700' : 
                order.orderStatus === OrderStatus.PreparingForDispatch ? 'bg-purple-200 text-purple-700' : 
                order.orderStatus === OrderStatus.OrderReceived ? 'bg-orange-200 text-orange-700' : 
                'bg-red-200 text-red-700'}`}
              >
                <option value={OrderStatus.OrderReceived}>Order Received</option>
                <option value={OrderStatus.PreparingForDispatch}>Preparing for Dispatch</option>
                <option value={OrderStatus.Dispatched}>Dispatched</option>
                <option value={OrderStatus.InTransit}>In Transit</option>
                <option value={OrderStatus.Delivered}>Delivered</option>
              </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Banner key={notificationKey} message={notification.message} type={notification.type} />
    </div>
  );
};


