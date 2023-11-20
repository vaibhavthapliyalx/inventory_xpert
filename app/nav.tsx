'use client';
import { useEffect, useState } from 'react';
import Navbar from './components/navbar';
import CoreConnector from './InterfaceAPI/CoreConnector';
import { Admin } from './interface/CommonInterface';
import { useRouter } from 'next/navigation';

// Retrieve the singleton instance of CoreConnector Class.
const coreConnectorInstance = CoreConnector.getInstance();

/**
 * Renders the navigation component.
 * 
 * @returns The rendered navigation component.
 */
export default function Nav() {
  const router = useRouter();
  const [loggedin, setLoggedin] = useState<Admin>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log("Fetching loggedin admin");
    coreConnectorInstance.getLoggedInAdmin()
      .then((result : any) => {
        console.log(result);
        setIsLoggedIn(true);
        setLoggedin(result);
      })
      .catch((error) => {
        console.log(error);
        setLoggedin(undefined);
        setIsLoggedIn(false);
        router.push('/login');
      });
  }, []);

  /**
   * Logs out the user and redirects to the login page.
   */
  function logout() {
    coreConnectorInstance.logout()
      .then((result) => {
        console.log(result);
        setIsLoggedIn(false);
        router.push('/login');
      })
      .catch((error) => {
        setIsLoggedIn(true);
        console.log(error);
      });
    }

  return (
    <>
    { isLoggedIn && (
      <Navbar
        user={loggedin}
        onLogout={logout}
      /> 
    )}
    </>
  );
}