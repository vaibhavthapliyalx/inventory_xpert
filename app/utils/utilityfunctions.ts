import { Admin, Gender, ProfilePhoto } from "../interface/CommonInterface";

export function getProfilePhoto(user: Admin): any {
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

export function getProfilePhotoName(gender: Gender) {
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