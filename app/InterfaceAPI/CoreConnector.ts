// This class is a singleton.
"use client"
import axios from "axios";
import qs from "qs";
import { Admin, Customer, JointCustomerWithOrders, MembershipStatus, Order, Product, SortOrder } from "../interface/CommonInterface";

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
    * Finds a product by its name.
    * 
    * @param category The name of the product to find.
    * @returns Promise<Product[]>
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
    * Finds a customer by its membership status.
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
   async updateOrderStatus(orderId:number, status:string) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
      axios.post('/api/update-order-status', { order_id: orderId, order_status: status })
      .then((result:any) => {
        resolve(result);
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

   // Dont use this function. It is not working for now.
   async getOrdersWithCustomerDetailsForProducts(productIds:number[]) : Promise<JointCustomerWithOrders[]> {
    return new Promise<JointCustomerWithOrders[]>((resolve, reject) => {
      axios.get('/api/get-orders-with-customer-details', { 
        params: { product_ids: productIds },
        paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'})
      })
      .then((result:any) => {
        let orders:JointCustomerWithOrders[] = [];
        result.data.map((item:any) => {
          let order: JointCustomerWithOrders = {
            orderId: item._id,
            customerId: item.customer_id,
            customer: item.customer,
            products: item.products,
            orderDate: item.order_date,
            totalPrice: item.total_price,
            deliveryStatus: item.delivery_status
          };
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
  
   /********* Authentication Handlers ************/

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
