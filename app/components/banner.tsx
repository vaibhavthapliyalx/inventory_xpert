// This file contains the banner component. This component is used to display a notification message to the user.

// Directive to use client side rendering.
'use client';

// Imports
import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BannerType } from '../Shared/Enums';

/**
 * This function renders the banner component.
 * 
 * @param message The message to be displayed in the banner.
 * @param type The type of the banner.
 * @returns Banner Component.
 */
export default function Banner({ message, type}: {message: string, type: BannerType}) {
  // State variable.
  const [displayingBanner, setDisplayingBanner] = useState<boolean>(false);

  // This useEffect hook sets the displayingBanner state to true when new message is received.
  useEffect(() => {
    if (message && message.length> 0) {
      setDisplayingBanner(true);
    }
  }, [message, type]);

  /********************** Render Function **********************/
  return (
    <>
      {displayingBanner && (
        <div className={`notification ${type === BannerType.Success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-4 rounded-md my-4 flex items-center justify-between`}>
          <div className="flex items-center">
            {type === BannerType.Success ? <CheckCircleIcon className="h-5 w-5 mr-2" /> : <ExclamationCircleIcon className="h-5 w-5 mr-2" />}
            <span className='font-bold'>{type}:</span> {" "} {message}
          </div>
          <XMarkIcon className="h-5 w-5 cursor-pointer" onClick={() => setDisplayingBanner(false)} />
        </div>
      )}
    </>
  );
};