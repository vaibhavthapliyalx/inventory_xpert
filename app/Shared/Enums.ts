// This file contains all the enums used in the application.

/**
 * @enum Gender
 * This enum defines the Gender options used in forms.
 * 
 * @property Male - Gender Option.
 * @property Female - Gender Option.
 * @property Other - Gender Option.
 */
export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

/**
 * @enum ProfilePhoto
 * This enum defines the Profile Photo options used in forms.
 * 
 * @property Male - Profile Photo Option.
 * @property Female - Profile Photo Option.
 * @property Default - Profile Photo Option.
 */
export enum ProfilePhoto {
  Male = "male.png",
  Female = "female.png",
  Default = "avatar_placeholder.png"
}

/**
 * @enum SortOrder
 * This enum defines the Sort Order used in tables.
 * 
 * @property Ascending - Sort Order Option.
 * @property Descending - Sort Order Option.
 */
export enum SortOrder {
  Ascending = "asc",
  Descending = "desc"
}

/**
 * @enum TableType
 * This enum defines the Table Type used in tables.
 * 
 * @property Customer - Table Type Option.
 * @property Product - Table Type Option.
 */
export enum TableType {
  Customer = "customer",
  Product = "product",
  Order = "order"
}

/**
 * @enum MembershipStatus
 * This enum defines the Membership Status used to classify customers.
 * 
 * @property Member - Membership Status Option.
 * @property NonMember - Membership Status Option.
 */
export enum MembershipStatus{
  Member = 'Member',
  NonMember = 'Non-member',
}

/**
 * @enum OrderStatus
 * This enum defines the Order Status used to classify orders based on their order state.
 * 
 * @property Awaiting - Order Status Option.
 * @property InTransit - Order Status Option.
 * @property Complete - Order Status Option
 */
export enum OrderStatus{
  Awaiting = 'Awaiting',
  InTransit = 'In Transit',
  Complete = 'Complete',
}

/**
 * @enum BannerType
 * This enum defines the Banner Type to be used in the Banner component to display success or error messages.
 * 
 * @property Success - Success Message Banner.
 * @property Error - Error Message Banner.
 */
export enum BannerType {
  Success = "Success",
  Error = "Error"
}
