// This file contains all the common interfaces used in the application.

// Imports
import { Gender, OrderStatus } from "./Enums";

/**
 * @interface Customer
 * This interface defines the structure of the customer object.
 * 
 * @property {number} id - The id of the customer.
 * @property {string} name - The name of the customer.
 * @property {ContactDetails} contact - The contact details of the customer.
 * @property {string} membershipStatus - The membership status of the customer.
 * @property {Order["id"][]} previousOrders - The previous orders of the customer.
 */
export interface Customer {
  id: number;
  name: string;
  contact: ContactDetails;
  membershipStatus: string;
  previousOrders: Order["id"][] | string[];
}

/**
 * @interface Product
 * This interface defines the structure of the product object.
 * 
 * @property {number} id - The id of the product.
 * @property {string} name - The name of the product.
 * @property {string} category - The category of the product.
 * @property {number} price - The price of the product.
 * @property {number} stockQuantity - The stock quantity of the product.
 * @property {string} description - The description of the product.
 */
export interface Product {
  id?: number;
  name: string;
  category?: string;
  price: number;
  stockQuantity: number;
  description: string;
}

/**
 * @interface Order
 * This interface defines the structure of the order object.
 * 
 * @property {number} id - The id of the order.
 * @property {number} customerId - The id of the customer who placed the order.
 * @property {Array<{productId: number, quantity: number}>} products - The products in the order.
 * @property {string} orderDate - The date on which the order was placed.
 * @property {number} totalPrice - The total price of the order.
 * @property {string} deliveryStatus - The delivery status of the order.
 * @property {string | OrderStatus} orderStatus - The order status of the order.
 */
export interface Order {
  id: number;
  customerId: number;
  products: Array<{
    productId: number;
    quantity: number;
  }>,
  orderDate: string;
  totalPrice: number;
  deliveryStatus: string;
  orderStatus: string | OrderStatus;
}

/**
 * @interface ContactDetails
 * This interface defines the structure of the contact details object.
 * 
 * @property {string} email - The email of the customer.
 * @property {string} phone - The phone number of the customer.
 * @property {string} address - The address of the customer.
 */
export interface ContactDetails {
  email: string;
  phone: string;
  address: string;
}

/**
 * @interface Admin
 * This interface defines the structure of the admin object.
 * 
 * @property {string} id - Optional: The id of the admin.
 * @property {string} fullName - The full name of the admin.
 * @property {Gender} gender - Optional: The gender of the admin.
 * @property {string} username - The username of the admin.
 * @property {string} password - Optional: The password of the admin.
 * @property {string} email - The email of the admin.
 * @property {string} profilePhoto - Optional: The file name of profile photo of the admin.
 */
export interface Admin {
  id?: string;
  fullName: string;
  gender?: Gender;
  username: string;
  password?: string;
  email: string;
  profilePhoto?: string;
}

/**
 * @interface OrdersWithAllDetails
 * This interface defines the structure of the orders with all details received from the backend.
 * 
 * @property {number} id - The id of the order.
 * @property {number} customerId - The id of the customer who placed the order.
 * @property {string} customerName - The name of the customer who placed the order.
 * @property {string} deliveryStatus - The delivery status of the order.
 * @property {string | OrderStatus} orderStatus - The order status of the order.
 * @property {string} orderDate - The date on which the order was placed.
 * @property {Product[]} products - The products in the order.
 * @property {number} totalPrice - The total price of the order.
 * @property {number} totalQuantity - The total quantity of the order.
 * @property {number} totalSales - The total sales of the order.
 */
export interface OrdersWithAllDetails {
  id: number;
  customerId: number;
  customerName: string;
  deliveryStatus: string;
  orderStatus: OrderStatus;
  orderDate: string;
  products: [];
  totalPrice: number;
  totalQuantity: number;
  totalSales: number;
}

/**
 * @interface TotalSalesForCustomer
 * This interface defines the structure of the total sales for customer object.
 * 
 * @property {number} customerId - The id of the customer.
 * @property {number} totalSales - The total sales for the customer.
 */
export interface TotalSalesForCustomer {
  customerId: number;
  totalSales: number;
}

/**
 * @interface NumOrdersForCustomer
 * This interface defines the structure of the number of orders for customer object.
 * 
 * @property {number} customerId - The id of the customer.
 * @property {number} numOrders - The number of orders for the customer.
 */
export interface NumOrdersForCustomer {
  customerId: number;
  totalOrders: number;
}



  
