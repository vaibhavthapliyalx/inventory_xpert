// This class is a singleton.
import axios from "axios";

/**
 * Provides functions to connect to the backend.
 */
export default class CoreConnector {
  private static instance: CoreConnector; 
  private constructor() {
    console.log("CoreConnector initalised!");
  }

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
        reject(result);
      })
    })
   }

   async getAllProducts() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      axios.get('/api/all-products')
      .then((result:any) => {
        resolve(result);
      })
      .catch((result:any) => {
        reject(result);
      })
    })
   }

   async getAllCustomers() : Promise<any> {
    return new Promise<void>((resolve, reject) => {
      axios.get('/api/all-customers')
      .then((result:any) => {
        resolve(result.data);
      })
      .catch((result:any) => {
        reject(result);
      })
    })
   }

   async findProductByCategory(category:string) : Promise<any> {
    return new Promise<void>((resolve, reject) => {
      axios.get('/api/match-values-in-array', { params: { category: category } })
      .then((result:any) => {
        resolve(result.data);
      })
      .catch((result:any) => {
        reject(result);
      })
    })
   }

   async findCustomerByName(name:string) : Promise<any> {
    return new Promise<void>((resolve, reject) => {
      axios.get('/api/find-customers-by-name', { params: { name: name } })
      .then((result:any) => {
        console.log(result.data, name)
        resolve(result.data);
      })
      .catch((result:any) => {
        reject(result);
      })
    })
   }
}