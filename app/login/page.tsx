"use client";

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import CoreConnector from '../InterfaceAPI/CoreConnector';
import { Transition } from '@headlessui/react';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const coreConnectorInstance = CoreConnector.getInstance();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);


  // If user is already logged in, redirect to home page.
  useEffect(() => {
    async function checkLoggedIn() {
      coreConnectorInstance.getLoggedInAdmin()
      .then((result) => {
        console.log(result);
        router.push('/');
      })
      .catch((error) => {
        console.log(error);
      });
    }
    checkLoggedIn();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    coreConnectorInstance.login(formData.username, formData.password)
    .then(() => {
      router.push('/');
    })
    .catch((error) => {
      setError(error.message);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              onClick={handleTogglePassword}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
  
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

export default LoginPage;
