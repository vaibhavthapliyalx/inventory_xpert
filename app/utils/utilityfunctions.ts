// This file contains all utility functions used in the application.

// Imports
import { ProfilePhoto, Gender } from "../Shared/Enums";
import { Admin, Product} from "../Shared/Interfaces";

/**
 *  This function returns the profile photo of the user.
 * 
 * @param user The user whose profile photo is to be returned. 
 * @returns The profile photo of the user.
 */
export function getProfilePhoto(user: Admin | undefined): any {
    let image = require("../../public/assets/avatar_placeholder.png");
    if (user?.profilePhoto) {
        switch (user.profilePhoto) {
          case ProfilePhoto.Female:
            image  = require("../../public/assets/female.png");
            break;
          case ProfilePhoto.Male:
            image = require("../../public/assets/male.png");
            break;
          default:
            image  = require("../../public/assets/avatar_placeholder.png");
        }
    }
    return (image);
}

/**
 * This function returns the profile photo i.e. the image name for the gender provided.
 * 
 * @param gender The gender for which the name is to be returned.
 * @returns The image name.
 */
export function getProfilePhotoName(gender: Gender): string {
    console.log(gender)
    let profilePhotoName = 'avatar_placeholder.png';
    switch(gender) {
      case Gender.Female:
        profilePhotoName = 'female.png';
        break;
      case Gender.Male:
        profilePhotoName = 'male.png';
        break;
      default:
        profilePhotoName = 'avatar_placeholder.png';
    }
    return profilePhotoName;
  }

/**
 * This function return the list of available product categories.
 * 
 * @returns The list of available product categories.
 */
export function getProductCategoriesList(): string[] {
 const productCategories = ["Tables", "Chairs", "Shelves", "Beds"];
  return productCategories;
}