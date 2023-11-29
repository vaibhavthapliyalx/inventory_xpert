'use client';
// import { cookies } from 'next/headers';
import DismissButton from '../dismiss-button';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import CoreConnector from '../InterfaceAPI/CoreConnector';
import { GlobeAltIcon, MoonIcon, SunIcon } from '@heroicons/react/24/solid';

// Retrieve the singleton instance of CoreConnector Class.
const coreConnectorInstance = CoreConnector.getInstance();

const Footer = () => {
    const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
    const [isServerConnected, setIsServerConnected] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [response, setResponse] = useState({} as any);
  
    useEffect(() => {
      function checkServerConnection() {
        coreConnectorInstance.getServerConnectionStatus()
        .then((result : any) => {
          console.log(result);
          setResponse(result);
          if(result.status == 200) {
            setIsServerConnected(true);
          } else {
            setIsServerConnected(false);
          }
        })
        .catch((error) => { 
          setIsServerConnected(false);
          console.log(error);
        });
      }

      function checkDatabaseConnection() {
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
      }
  
      checkServerConnection();
      checkDatabaseConnection();
    }, []);
  
    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
      // Add logic to toggle dark/light mode for the entire app
    };
  
    return (
      <footer className="bg-white py-4 text-black mt-auto">
  <div className="container mx-auto flex justify-between items-center">
    <div className="flex items-center space-x-4">
      {/* All Systems Operational */}
      <div>
        <p className="text-sm mb-1">Connection Status</p>
        <div className="flex items-center space-x-2">
          {/* Database Status */}
          <p className="flex items-center text-sm">
            Database:
            <span
              className={`ml-2 h-3 w-3 mr-2 rounded-full ${
                isDatabaseConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </p>

          {/* Server Status */}
          <p className="flex items-center text-sm">
            Server:
            <span
              className={`ml-2 h-3 w-3 rounded-full ${
                isServerConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </p>
        </div>
      </div>
    </div>

    {/* Copyright and Language Selector */}
    <div className="flex items-center space-x-2 flex-col">
      <p className="text-sm flex-row">
        &copy; 2023 Inventory Xpert. All rights reserved.
      </p>
      <p className="text-sm flex-row">
        Made with &#9829; by Vaibhav.
      </p>
    </div>

    <div className="flex items-center space-x-2">
      <GlobeAltIcon className="h-5 w-5" />
      <p className="text-sm">English (United Kingdom)</p>
    </div>
  </div>
</footer>


    );
  };
  
  export default Footer;