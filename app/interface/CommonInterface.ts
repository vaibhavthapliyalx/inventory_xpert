export interface Customer {
  id: number;
  name: string;
  contact: ContactDetails;
  membershipStatus: string;
  previousOrders: Order["id"][] | string[];
}
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  description: string;
}

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

  export interface JointCustomerWithOrders {
    orderId: number;
    customerId: number;
    customer: Customer;
    products: {
      productId: number;
      quantity: number;
    }[];
    orderDate: string;
    totalPrice: number;
    deliveryStatus: string;
  }

export enum SortOrder {
  Ascending = "asc",
  Descending = "desc"
}

export enum TableType {
  Customer = "customer",
  Product = "product",
  Order = "order"
}
export enum MembershipStatus{
  Member = 'Member',
  NonMember = 'Non-member',
}

export enum OrderStatus{
  OrderReceived = 'Order Received',
  PreparingForDispatch = 'Preparing for Dispatch',
  Dispatched = 'Dispatched',
  InTransit = 'In Transit',
  Delivered = 'Delivered',
}
export enum BannerType {
  Success = "Success",
  Error = "Error"
}

  
