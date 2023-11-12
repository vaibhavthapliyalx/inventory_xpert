'use client';
// import { cookies } from 'next/headers';
import DismissButton from './dismiss-button';
import { useEffect, useState } from 'react';
import CoreConnector from './interfaces/CoreConnector';

const coreConnectorInstance = CoreConnector.getInstance();

export default function Toast() {
  // const cookieStore = cookies();
  // const isHidden = cookieStore.get('template-banner-hidden');
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [response, setResponse] = useState({} as any);

  // When the app loads, check if database is connected.
  useEffect(() => {
    coreConnectorInstance.getDatabaseConnectionStatus()
      .then((result : any) => {
        console.log(result);
        setResponse(result);
        if(result.status == 200) {
          setIsDatabaseConnected(true);
        } else {
          setIsDatabaseConnected(false);
        }
      })
      .catch((error) => {
        setIsDatabaseConnected(false);
        console.log(error);
      });
  },[]);


  return (
    <div className="sticky rounded-2xl w-11/12 sm:w-[581px] h-40 sm:h-[80px] p-0.5 z-10 bottom-10 left-0 right-0 mx-auto">
      <div className="rounded-[14px] w-full h-full bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-3 sm:space-y-0 px-5">
        <p className="text-black text-[13px] font-mono w-[304px] h-10 flex items-center justify-center p-3">
        <label className="font-semibold"> Database Status : {response.statusText} </label>
        <span
          className={`ml-2 h-4 w-4 mr-4 rounded-full inline-block ${
            isDatabaseConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <DismissButton />
        </p>
      </div>
    </div>
  );
}
