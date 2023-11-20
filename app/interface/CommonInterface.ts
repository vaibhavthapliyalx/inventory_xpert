export interface Customer {
  id: number;
  name: string;
  contact: ContactDetails;
  membershipStatus: string;
  previousOrders: Orders["id"][];
}
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  description: string;
}

export interface Orders {
  id: number;
  customerId: number;
  productId: number;
  orderDate: string;
  quantity: number;
}

export interface ContactDetails {
  email: string;
  phone: string;
  address: string;
}

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export interface Admin {
  id?: string;
  fullName: string;
  gender?: Gender;
  username: string;
  password?: string;
  email: string;
  profilePhoto?: string; // Profile photo is optional
}


  export enum ProfilePhoto {
    Male = "male.png",
    Female = "female.png",
    Default = "avatar_placeholder.png"
  }
