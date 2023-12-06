// Main API connector class.

// Imports
import axios from "axios";
import qs from "qs";
import { Admin, Customer, Order, OrdersWithAllDetails, Product, TotalSalesForCustomer } from "../Shared/Interfaces";
import { MembershipStatus, OrderStatus, SortOrder } from "../Shared/Enums";

/**
 * @class ApiConnector
 * This class handles all the API calls to the server.
 * 
 * This class is an interface between the frontend and the backend.
 * This class wraps all the functions that are used to connect to the backend.
 * This class is a singleton, i.e. only one instance of this class is created.
 * This helps in maintaining a single connection and prevents threading issues.
 */
export default class ApiConnector {
  // Singleton instance of ApiConnector class.
  private static instance: ApiConnector; 

  // Private constructor to prevent multiple instances of ApiConnector class.
  private constructor() {
    console.log("ApiConnector initalised!");
  }

  /**
   * Gets the instance of ApiConnector.
   * If the instance is not created, it creates a new instance.
   * If the instance is already created, it returns the existing instance.
   * 
   * @returns ApiConnector Instance
   */
  public static getInstance(): ApiConnector {
    if (!ApiConnector.instance) {
      ApiConnector.instance = new ApiConnector();
    }
    return ApiConnector.instance;
  }

  /**
   * This function sends a GET request to the server to get the database connection status
   * by pinging the database.
   * 
   * @returns Promise<void> - The promise resolves if the database is connected, otherwise it rejects.
   */
   async getDatabaseConnectionStatus() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      axios.get('/api/db_connectivity')
      .then((result:any) => {
        resolve(result);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to get the server connection status.
    * 
    * @returns Promise<void> - The promise resolves if the server is connected, otherwise it rejects.
    */
   async getServerConnectionStatus() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      axios.get('/api/server_connectivity')
      .then((result:any) => {
        resolve(result);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to get all the products from the database.
    * 
    * @returns Promise<Product[]> - The promise resolves if the products are fetched, otherwise it rejects.
    */
   async getAllProducts() : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/all-products')
      .then((result:any) => {
        let products:Product[] = [];
        result.data.map((product:Product, index:number) => { 
          product.id = result.data[index]._id;
          product.category = result.data[index].category;
          product.description = result.data[index].description;
          product.name = result.data[index].name;
          product.price = result.data[index].price;
          product.stockQuantity = result.data[index].stock_quantity;
          products.push(product);
        })
        resolve(products);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to get all the customers from the database.
    * 
    * @returns Promise<Customer[]> - The promise resolves if the customers are fetched, otherwise it rejects.
    */
   async getAllCustomers() : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/all-customers')
      .then((result:any) => {
        let customers:Customer[] = [];
        result.data.map((customer:any) => { 
          let customerObj: Customer = {
            id: 0,
            name: "",
            contact: {
              email: "",
              phone: "",
              address: ""
            },
            membershipStatus: "",
            previousOrders: []
          } ;
          customerObj.id = customer._id;
          customerObj.contact.address = customer.contact.address;
          customerObj.contact.email = customer.contact.email;
          customerObj.contact.phone = customer.contact.phone;
          customerObj.membershipStatus = customer.membership_status;
          customerObj.name = customer.name;
          customerObj.previousOrders = customer.previous_orders;
          customers.push(customerObj);
        })

        resolve(customers);    
      })
      .catch((result:any) => {
        reject(result);
      })
    })
   }

   /**
    * This function sends a GET request to the server to get all the orders from the database.
    * 
    * @returns Promise<Order[]> - The promise resolves if the orders are fetched, otherwise it rejects.
    */
   async getAllOrders() : Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/all-orders')
      .then((result:any) => {
        let orders:Order[] = [];
        result.data.map((item:any, index:number) => {
          let order: Order = {
            id: 0,
            customerId: 0,
            products: [{
              productId: 0,
              quantity: 0
            }],
            orderDate: "",
            totalPrice: 0,
            deliveryStatus: "",
            orderStatus: ""
          };
          order.id = item._id;
          order.customerId = item.customer_id;
          order.products = item.products;
          order.orderDate = item.order_date;
          order.deliveryStatus = item.delivery_status;
          order.totalPrice = item.total_price;
          order.orderStatus = item.order_status;

          orders.push(order);
        })
        resolve(orders);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
  }

   /**
    * This function sends a GET request to the server and fetches the products with the given categories.
    * 
    * @param category The categories of the products to find.
    * @returns Promise<Product[]> - The promise resolves if the products are fetched, otherwise it rejects.
    */
   async findProductsByCategory(category:string[]) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/find-products-by-multiple-categories', { 
        params: { category: category },
        paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'})
       })
      .then((result: any) => {
       let products:Product[] = [];
        result.data.map((product:Product, index:number) => { 
          product.id = result.data[index]._id;
          product.category = result.data[index].category;
          product.description = result.data[index].description;
          product.name = result.data[index].name;
          product.price = result.data[index].price;
          product.stockQuantity = result.data[index].stock_quantity;
          products.push(product);
        })
        resolve(products);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends the GET request to the server to search a customer by its name.
    * 
    * @param name  The name of the customer to find.
    * @returns Promise<Customer[]> - The promise resolves if the customer is fetched, otherwise it rejects.
    */
   async searchCustomerByName(name:string) : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/search-customers-by-name', { params: { query: name } })
      .then((result:any) => {
        let customers:Customer[] = [];
        result.data.map((customer:Customer, index:number) => { 
          customer.id = result.data[index]._id;
          customer.contact = result.data[index].contact;
          customer.membershipStatus = result.data[index].membership_status;
          customer.name = result.data[index].name;
          customer.previousOrders = result.data[index].previous_orders;
          customers.push(customer);
        })
        resolve(customers);    
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to search a customer by its name.
    * 
    * @param name The name of the customer to find.
    * @returns Promise<any>
    */
   async searchOrderByCustomerName(name:string) : Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/search-orders-by-customer-name', { params: { query: name } })
      .then((result:any) => {
        let orders: Order[] = [];
        result.data.map((item:any, index:number) => {
          let order: Order = {
            id: 0,
            customerId: 0,
            products: [{
              productId: 0,
              quantity: 0
            }],
            orderDate: "",
            totalPrice: 0,
            deliveryStatus: "",
            orderStatus: ""
          };
          order.id = item._id;
          order.customerId = item.customer_id;
          order.products = item.products;
          order.orderDate = item.order_date;
          order.deliveryStatus = item.delivery_status;
          order.orderStatus = item.order_status;
          orders.push(order);
        })
        resolve(orders);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server and finds a customer by its membership status.
    * 
    * @param status The membership status of the customer to find.
    * @returns Promise<Customer[]>
    */
   async findCustomerByMembershipStatus(membership: MembershipStatus) : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/find-customers-by-membership-status', { params: { membership_status: membership } })
      .then((result:any) => {
        console.log(result);
        let customers:Customer[] = [];
        result.data.map((customer:Customer, index:number) => { 
          customer.id = result.data[index]._id;
          customer.contact = result.data[index].contact;
          customer.membershipStatus = result.data[index].membership_status;
          customer.name = result.data[index].name;
          customer.previousOrders = result.data[index].previous_orders;
          customers.push(customer);
        })
        resolve(customers);    
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }
   
   /**
    * This function sends a GET request to the server and finds a product within specified price range.
    * 
    * @param min Minimum price
    * @param max Maximum price
    * @returns Promise<Product[]>
    */
   async findProductsWithinPriceRange(min:number, max:number) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/find-products-within-price-range', { params: { min_price: min, max_price: max } })
      .then((result:any) => {
        let products:Product[] = [];
        result.data.map((product:Product, index:number) => { 
          product.id = result.data[index]._id;
          product.category = result.data[index].category;
          product.description = result.data[index].description;
          product.name = result.data[index].name;
          product.price = result.data[index].price;
          product.stockQuantity = result.data[index].stock_quantity;
          products.push(product);
        })
        resolve(products);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a PUT request to the server to update the order status.
    * 
    * @param orderId ID of the order to update.
    * @param status New status of the order. 
    * @returns Promise<any>
    */
   async updateOrderStatus(orderId:number, status:string) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
      axios.put('/api/update-order-status', { order_id: orderId, order_status: status })
      .then((result:any) => {
        resolve(result);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    *  This function sends a GET request to the server to find the products with the given categories.
    * 
    * @param categories  The categories of the products to find.
    * @returns  Promise<Product[]>
    */
   async findProductsByMultipleCategories(categories:string[]) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/find-products-by-multiple-categories', { params: { categories: categories } })
      .then((result:any) => {
        let products:Product[] = [];
        result.data.map((product:Product, index:number) => { 
          product.id = result.data[index]._id;
          product.category = result.data[index].category;
          product.description = result.data[index].description;
          product.name = result.data[index].name;
          product.price = result.data[index].price;
          product.stockQuantity = result.data[index].stock_quantity;
          products.push(product);
        })
        resolve(products);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to retrieve the products sorted by price.
    * @param order The order of sorting.
    * @returns Promise<Product[]>
    */
   async getProductsSortedByPrice(order: SortOrder) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      let sort = 'desc';
      if (order === SortOrder.Ascending ) {
        sort = 'asc';
      }
      axios.get('/api/products-sorted-by-price', { params: { sort_order: sort } })
      .then((result:any) => {
        console.log(result);
        let products:Product[] = [];
        result.data.map((product:Product, index:number) => { 
          product.id = result.data[index]._id;
          product.category = result.data[index].category;
          product.description = result.data[index].description;
          product.name = result.data[index].name;
          product.price = result.data[index].price;
          product.stockQuantity = result.data[index].stock_quantity;
          products.push(product);
        })
        resolve(products);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to find the customer by its email address.
    * 
    * @param email The email address of the customer to find.
    * @returns Promise<Customer[]>
    */
   async findCustomerByEmailAddress(email:string) : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/find-customer-by-email', { params: { email: email } })
      .then((result:any) => {
        let customers:Customer[] = [];
        result.data.map((customer:Customer, index:number) => { 
          customer.id = result.data[index]._id;
          customer.contact = result.data[index].contact;
          customer.membershipStatus = result.data[index].membership_status;
          customer.name = result.data[index].name;
          customer.previousOrders = result.data[index].previous_orders;
          customers.push(customer);
        })
        resolve(customers);    
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to retrieve the customer by it's id.
    * 
    * @param customerId ID of the customer to find.
    * @returns Promise<Customer>
    */
   async getCustomerByCustomerID(customerId:number) : Promise<Customer> {
    return new Promise<Customer>((resolve, reject) => {
      axios.get('/api/get-customer-by-customer-id', { params: { customer_id: customerId } })
      .then((result:any) => {
        let customer:Customer = {
          id: result.data._id,
          name: result.data.name,
          contact: result.data.contact,
          membershipStatus: result.data.membership_status,
          previousOrders: result.data.previous_orders
        } ;
        resolve(customer);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to retrieve the customers by their order ids.
    * 
    * @param orderIds IDs of the order to find.
    * @returns Promise<Order>
    */
   async findCustomerByPreviousOrders(orderIds:number[]) : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/find-customer-by-previous-orders',{
        params: { previous_orders: orderIds },
        paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'})
       })
      .then((result:any) => {
        let customers:Customer[] = [];
        result.data.map((customer : any) => { 
          let customerObj: Customer = {
            id: customer._id,
            name: customer.name,
            contact: customer.contact,
            membershipStatus: customer.membership_status,
            previousOrders: customer.previous_orders
          } ;
          customers.push(customerObj);
        })
        resolve(customers);    
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to search the products by their name.
    * 
    * @param name The name of the product to find.
    * @returns  Promise<Product[]>
    */
   async searchProductsByName(name:string) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/search-products-by-name', { params: { query: name } })
      .then((result:any) => {
        let products:Product[] = [];
        result.data.map((product:Product, index:number) => { 
          product.id = result.data[index]._id;
          product.category = result.data[index].category;
          product.description = result.data[index].description;
          product.name = result.data[index].name;
          product.price = result.data[index].price;
          product.stockQuantity = result.data[index].stock_quantity;
          products.push(product);
        })
        resolve(products);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to find the orders by their order ids.
    * 
    * @param orderIds  The ids of the orders to find.
    * @returns  Promise<Order[]>
    */
   async findOrdersByOrderIDs(orderIds:number[]) : Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/find-orders-by-order-ids', { 
        params: { order_ids: orderIds },
        paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'})
      })
      .then((result:any) => {
        let orders: Order[] = [];
        result.data.map((item:any, index:number) => {
          let order: Order = {
            id: 0,
            customerId: 0,  
            products: [{
              productId: 0,
              quantity: 0
            }],
            orderDate: "",
            totalPrice: 0,
            deliveryStatus: "",
            orderStatus: ""
          };
          order.id = item._id;
          order.customerId = item.customer_id;
          order.products = item.products;
          order.orderDate = item.order_date;
          order.totalPrice = item.total_price;
          order.deliveryStatus = item.delivery_status;
          order.orderStatus = item.order_status;
          orders.push(order);
        })
        resolve(orders);
      })
      .catch((result:any) => {
        reject(result);
      })
    })
   }

   /**
    * This function sends a GET request to the server to find the products by their ids.
    * 
    * @param productIds  The ids of the products to find.
    * @returns  Promise<Product[]>
    */
   findProductsByProductIDs(productIds:number[]) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/find-products-by-product-ids', { 
        params: { product_ids: productIds },
        paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'})
      })
      .then((result:any) => {
        let products:Product[] = [];
        result.data.map((product:Product, index:number) => { 
          product.id = result.data[index]._id;
          product.category = result.data[index].category;
          product.description = result.data[index].description;
          product.name = result.data[index].name;
          product.price = result.data[index].price;
          product.stockQuantity = result.data[index].stock_quantity;
          products.push(product);
        })
        resolve(products);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   /**
    *  This function sends a GET request to the server to get the total price of all the orders with the given ids.
    * 
    * @param orderIds  The ids of the orders to find.
    * @returns Promise<number>
    */
   async getTotalPriceOfAllOrders(orderIds: number[]) : Promise<number> {
    return new Promise<number>((resolve, reject) => {
      axios.get('/api/get-total-price-of-all-orders', { params: { orders: orderIds } })
      .then((result:any) => {
        resolve(result.data);
      })
      .catch((error) => {
        reject(error.response.data);
      })
    })
   }

   /**
    * This function sends a GET request to the server to retrieve all orders with all the details associated with it.
    * This includes the customer details and the product details.
    * 
    * @returns Promise<any> - The promise resolves if the orders are fetched, otherwise it rejects.
    */
   async fetchAllOrdersWithDetails() {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/fetch-orders-with-details')
      .then((result:any) => {
        console.log(result)
        let orders: OrdersWithAllDetails[] = [];
        result.data.map((item:any, index:number) => {
          let order: OrdersWithAllDetails = {
            id: item.id,
            customerId: item.customerId,
            customerName: item.customerName,
            products: item.products,
            orderDate: item.orderDate,
            totalPrice: item.totalPrice,
            deliveryStatus: item.deliveryStatus,
            orderStatus: item.orderStatus,
            totalQuantity: item.totalQuantity,
            totalSales: item.totalSales
          };
          orders.push(order);
        })
        resolve(orders);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
  }

  /**
   * This function sends a GET request to the server to retrieve the total sales for each customer.
   * 
   * @returns Promise<TotalSalesForCustomer[]> - The promise resolves if the total sales are fetched, otherwise it rejects.
   */
  async getTotalSalesForEachCustomer() {
    return new Promise<TotalSalesForCustomer[]>((resolve, reject) => {
      axios.get('/api/total-sales-per-customer')
      .then((result:any) => {
        let totalSales:TotalSalesForCustomer[] = [];
        result.data.map((item:any) => {
          let obj: TotalSalesForCustomer = {
            customerId: item.customer_id,
            totalSales: item.total_sale
          }
          totalSales.push(obj);
        })
        resolve(totalSales);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
  }

  /**
   * This function sends a GET request to the server to retrieve the orders with the given number of products.
   * 
   * @param num The number of products in the order.
   */
  async getOrdersWithNumProducts(num: number) {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/orders-with-number-of-products', { params: { num_products: num } })
      .then((result:any) => {
        console.log(num)
        console.log(result)
        let orders: OrdersWithAllDetails[] = [];
        result.data.map((item:any) => {
          let order: OrdersWithAllDetails = {
            id: item.id,
            customerId: item.customerId,
            customerName: item.customerName,
            products: item.products,
            orderDate: item.orderDate,
            totalPrice: item.totalPrice,
            deliveryStatus: item.deliveryStatus,
            orderStatus: item.orderStatus,
            totalQuantity: item.totalQuantity,
            totalSales: item.totalSales
          };
          orders.push(order);
        })
        resolve(orders);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
    
  }

   /************************** Authentication Handlers **************************/

   /**
    * This function sends a POST request to the server to sign up a new admin.
    * 
    * @param Admin The admin object that contains the admin details and signs up with these details.
    * @returns Promise<string> - The promise resolves if the admin is signed up, otherwise it rejects.
    */
  async signup({fullName, username, password, profilePhoto, email}: Admin): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        console.log('Signup Data:', {fullName,username,email, password, profilePhoto});
        axios.post('/api/signup', {
          fullname: fullName,
          username : username,
          password : password,
          email: email,
          profile_photo : profilePhoto,
        })
        .then((result:any) => {
          resolve(result);
        })
        .catch((error:any) => {
          reject(error.response.data);
        })
    });
  }
  

  /**
   * This function sends a POST request to the server to login an admin.
   * The admin is logged in if the username and password are correct.
   * If successful, the token is stored in the local storage.
   * This token is used to authenticate the admin for all the requests.
   * Thus requiring the admin to login only once.
   * Please Note: The token is valid for 24 hours only.
   * Any request made after 24 hours will require the admin to login again.
   * 
   * @param username The username of the admin.
   * @param password The password of the admin.
   * @returns Promise<Admin> - The promise resolves if the admin is logged in, otherwise it rejects.
   */
  async login(username: string, password: string): Promise<Admin> {
    return new Promise<Admin>((resolve, reject) => {
      axios.post('/api/login', {
        username: username,
        password: password,
      })
      .then((response:any) => {
        const admin: Admin = {
          id: response.data.admin_id,
          fullName: response.data.full_name,
          email: response.data.email,
          username: response.data.username,
          password: response.data.password,
          profilePhoto: response.data.profile_photo,
        };
        // Store the token in local storage
        localStorage.setItem('token', response.data.token);
        resolve(admin);
      })
      .catch((error:any) => {
        reject(error.response.data);
      });
    });
  }   

  /**
   * This function sends a GET request to the server and validates the token,
   * If the token is valid, the admin is logged out.
   * On successful logout, the token is removed from the local storage.
   * 
   * 
   * @returns Promise<void> - The promise resolves if the admin is logged out, otherwise it rejects.
   */
  async logout(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const token = localStorage.getItem('token'); // Get the token from local storage
      axios.get('/api/logout', {
        headers: {
          'x-access-token': token // Send the token in the headers
        }
      })
      .then((response:any) => {
        localStorage.removeItem('token'); // Remove the token from local storage
        resolve(response);
      })
      .catch((error:any) => {
        reject(error.response.data);
      });
    });
  }

  /**
   * This function sends a GET request to the server and validates the token,
   * If the token is valid, the logged in admin is returned.
   * 
   * @returns Promise<Admin> - The promise resolves if the admin is logged in, otherwise it rejects.
   */
  async getLoggedInAdmin(): Promise<Admin> {
    return new Promise<Admin>((resolve, reject) => {
      const token = localStorage.getItem('token'); // Get the token from local storage
      console.log("Token:", token);
      axios.get('/api/logged-in-admin', {
        headers: {
          'x-access-token': token // Send the token in the headers
        }
      })
      .then((response:any) => {
        const admin: Admin = {
          id: response.data.id,
          fullName: response.data.fullname,
          email: response.data.email,
          username: response.data.username,
          profilePhoto: response.data.profile_photo,
        };
        resolve(admin);
      })
      .catch((error:any) => {
        reject(error.response.data);
      });
    });
  }
}
