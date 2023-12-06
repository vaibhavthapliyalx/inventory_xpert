// This file wraps up the navbar component and handles the logic for the navbar.

// Directive to use client side rendering.
'use client';

// Imports
import { useEffect, useState } from 'react';
import Navbar from './components/navbar';
import ApiConnector from './ApiConnector/ApiConnector';
import { Admin } from './Shared/Interfaces';
import { useRouter } from 'next/navigation';

// Grabs the instance of the ApiConnector Class (Singleton) which connects to the backend endpoints.
const apiConnectorInstance = ApiConnector.getInstance();

/**
 * Renders the navigation component.
 * The navbar is only rendered if the user is logged in.
 * If the user is not logged in, they are redirected to the login page.
 * 
 * @returns The rendered navigation component.
 */
export default function Nav() {
  // State variables.
  const[loggedin, setLoggedin] = useState<Admin>();
  const[isLoggedIn, setIsLoggedIn] = useState(false);

  // Uses the useRouter hook to get the router object.
  // This is helpful for redirecting the user to a different page by its path.
  const router = useRouter();

  // This useEffect hook checks if the user is already logged in on initial render.
  // If the user is not logged in, redirect them to the login page.
  useEffect(() => {
    apiConnectorInstance.getLoggedInAdmin()
      .then((result : any) => {
        console.log("Successfully fetched logged in admin.");
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
   * This function logs out the user and redirects to the login page.
   */
  function logout(): void {
    apiConnectorInstance.logout()
    .then((result) => {
      setIsLoggedIn(false);
      router.push('/login');
    })
    .catch((error) => {
      setIsLoggedIn(true);
      console.log(error);
    });
  }

  /********************** Render Function **********************/
  return (
    <>
    { isLoggedIn && (
      <Navbar
        admin={loggedin}
        onLogout={logout}
      /> 
    )}
    </>
  );
}