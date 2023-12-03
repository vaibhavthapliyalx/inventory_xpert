// This file contains the footer component. This component is used to display the footer of the application.

// Directive to use client side rendering.
'use client';

// Imports
import { useEffect, useState } from 'react';
import ApiConnector from '../ApiConnector/ApiConnector';
import { GlobeAltIcon } from '@heroicons/react/24/solid';

// Grabs the instance of the ApiConnector Class (Singleton) which connects to the backend endpoints.
const apiConnectorInstance = ApiConnector.getInstance();

/**
 * This function renders the footer component.
 * 
 * @returns Footer Component.
 */
export default function Footer() {
  // State variables.
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);

  // Fetch the connection status of the server and database on initial render.
  useEffect(() => {
    // Check the connection status of the server.
    function checkServerConnection() {
      apiConnectorInstance.getServerConnectionStatus()
      .then((result : any) => {
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
    // Check the connection status of the database.
    function checkDatabaseConnection() {
      apiConnectorInstance.getDatabaseConnectionStatus()
      .then((result : any) => {
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

    // Cleanup function to reset the state variables when the component unmounts.
    return function cleanup() {
      setIsDatabaseConnected(false);
      setIsServerConnected(false);
    }
  }, []);

   /********************** Render Function **********************/
  return (
    <footer className="bg-white py-4 text-black mt-auto">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
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
}