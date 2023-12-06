// This file contains the login page component.

// Directive to use client side rendering.
"use client";

// Imports
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import ApiConnector from '../ApiConnector/ApiConnector';
import { Transition } from '@headlessui/react';

// Grabs the instance of the ApiConnector Class (Singleton) which connects to the backend endpoints.
const apiConnectorInstance = ApiConnector.getInstance();

/**
 * This function renders the login page component.
 * 
 * @returns The rendered login page component.
 */
export default function LoginPage() {
  // State variables.
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Uses the useRouter hook to get the router object.
  // This is helpful for redirecting the user to a different page by its path.
  const router = useRouter();

  // This useEffect hook checks if the user is already logged in on initial render.
  // If the user is alreay logged in, redirect them to the dashboard page.
  // Otherwise, do nothing.
  useEffect(() => {
    async function checkLoggedIn() {
      apiConnectorInstance.getLoggedInAdmin()
      .then((result) => {
        console.log(result);
        router.push('/');
      })
      .catch((error) => {
        console.log(error);
      });
    }
    // Check if the user is logged in.
    checkLoggedIn();
  }, []);

  /**
   *  This function handles the submit event.
   * 
   * @param e The event object received from the form on submit.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    apiConnectorInstance.login(formData.username, formData.password)
    .then(() => {
      router.push('/');
    })
    .catch((error) => {
      setError(error.message);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  }

  /**
   * This function handles the change event for the form fields.
   * 
   * @param e The event object received from the form field.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  /********************** Render Function **********************/
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md">
        <div className="text-center mb-6">
          <Image
            src={require('../../public/assets/logo_stretched.png')}
            alt="Logo"
            width={130}
            height={100}
            className="mx-auto h-auto w-auto my-4"
          />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
            New User?{' '}
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here.
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            id="username"
            autoComplete="username"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Username or Email"
            value={formData.username}
            onChange={handleChange}
          />
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm "
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Displays the submitting animation */}  
          <Transition
            show={isSubmitting}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="text-gray-600">Submitting...</div>
          </Transition>

          {/* Displays the error message */}
          {error && (
            <div className="flex items-center mt-4">
              <ExclamationCircleIcon className={`text-red-500 mr-2 ${error.length> 30 ?"h-10 w-10": "h-5 w-5" }`} aria-hidden="true" />
              <span className="text-red-500">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

