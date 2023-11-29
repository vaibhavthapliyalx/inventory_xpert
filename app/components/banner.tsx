'use client';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BannerType } from '../interface/CommonInterface';

export const Banner = ({ message, type}: {message: string, type: BannerType
}) => {
  const [displayingBanner, setDisplayingBanner] = useState<boolean>(false);
  useEffect(() => {
    if (message && message.length> 0) {
        setDisplayingBanner(true);
    }
  }, [message, type]);

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