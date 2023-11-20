// This class is a singleton.
"use client"
import axios from "axios";
import { Admin, Customer, Product } from "../interface/CommonInterface";

/**
 * Provides functions to connect to the backend.
 */
export default class CoreConnector {
  private static instance: CoreConnector; 
  private constructor() {
    console.log("CoreConnector initalised!");
  }
  

  /**
   * Gets the instance of CoreConnector.
   * 
   * @returns CoreConnector Instance
   */
  public static getInstance(): CoreConnector {
    if (!CoreConnector.instance) {
      CoreConnector.instance = new CoreConnector();
    }
    return CoreConnector.instance;
  }

  /**
   * Gets Database connection status.
   * @returns Promise<void>
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
    *  Gets Server connection status.
    * @returns Promise<void>
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
    * Gets all products from the database.
    * 
    * @returns Promise<Product[]>
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
    * Gets all customers from the database.
    * 
    * @returns Promise<Customer[]>
    */
   async getAllCustomers() : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/all-customers')
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

   async getAllOrders() : Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/all-orders')
      .then((result:any) => {
        let orders:any[] = [];
        result.data.map((order:any, index:number) => { 
          order.id = result.data[index]._id;
          order.customerId = result.data[index].customer_id;
          order.productId = result.data[index].product_id;
          order.orderDate = result.data[index].order_date;
          order.quantity = result.data[index].quantity;
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
    * Finds a product by its name.
    * 
    * @param category The name of the product to find.
    * @returns Promise<Product[]>
    */
   async findProductsByCategory(category:string) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/find-products-by-category', { params: { query: category } })
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
    * Finds a customer by its name.
    * 
    * @param name  The name of the customer to find.
    * @returns  Promise<Customer[]>
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
    * Finds a customer by its membership status.
    * 
    * @param status The membership status of the customer to find.
    * @returns Promise<Customer[]>
    */
   async findCustomerByMembershipStatus(status:string) : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/find-customers-by-membership-status', { params: { membership_status: status } })
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
    * Finds a product within specified price range.
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

   async getProductsSortedByPrice(order: string) : Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      axios.get('/api/get-products-sorted-by-price', { params: { order: order } })
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

   async findCustomerByEmailAddress(email:string) : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/find-customer-by-email-address', { params: { email: email } })
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

   async findCustomerByPreviousOrders(orderIds:number[]) : Promise<Customer[]> {
    return new Promise<Customer[]>((resolve, reject) => {
      axios.get('/api/find-customer-by-previous-orders', { params: { orders: orderIds } })
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

   async findOrdersByOrderIDs(orderIds:number[]) : Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/find-orders-by-order-ids', { params: { order_ids: orderIds } })
      .then((result:any) => {
        let orders:any[] = [];
        result.data.map((order:any, index:number) => { 
          order.id = result.data[index]._id;
          order.customerId = result.data[index].customer_id;
          order.productId = result.data[index].product_id;
          order.orderDate = result.data[index].order_date;
          order.quantity = result.data[index].quantity;
          orders.push(order);
        })
        resolve(orders);
      })
      .catch((result:any) => {
        reject(result.response.data);
      })
    })
   }

   // Dont use this function. It is not working for now.
   async getOrdersWithCustomerDetailsForProducts(productIds:number[]) : Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      axios.get('/api/get-orders-with-customer-details-for-products', { params: { products: productIds } })
      .then((result:any) => {
        let orders:any[] = [];
        result.data.map((order:any, index:number) => { 
          order.id = result.data[index]._id;
          order.customerId = result.data[index].customer_id;
          order.productId = result.data[index].product_id;
          order.orderDate = result.data[index].order_date;
          order.quantity = result.data[index].quantity;
          orders.push(order);
        })
        resolve(orders);
      })
      .catch((error) => {
        reject(error.response.data);
      })
    })
   }
  
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
  

  // Function to handle user login
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

  // Function to handle user logout
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
   *  Gets the logged in admin object.
   * @returns Promise<Admin>
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
