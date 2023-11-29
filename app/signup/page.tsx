"use client";
// pages/signup.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CoreConnector from '../InterfaceAPI/CoreConnector';
import Image from 'next/image';
import { Transition } from '@headlessui/react';
import { Admin, Gender } from '../interface/CommonInterface';
import { ExclamationCircleIcon,EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { getProfilePhotoName } from '../utils/utilityfunctions';

const coreConnectorInstance = CoreConnector.getInstance();

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Admin>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    id: '',
    gender: Gender.Female
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData.gender)
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      console.error('Email and password are required.');
      return;
    }

 
    // generate random id, choose photo based on gender.
    setIsSubmitting(true);
    coreConnectorInstance.signup({
      username: formData.email.split('@')[0],
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      profilePhoto: getProfilePhotoName(formData.gender? formData.gender : Gender.Female) ,
    })
    .then(() => {
      router.push('/login');
    })
    .catch((error) => {
      setError(error.message);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
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
        <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Already a user?{' '}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in here.
          </a>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md space-y-6">
          <div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
          <div>
            <select
              id="gender"
              name="gender"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-b-md sm:text-sm"
              onChange={handleChange}
              placeholder="Choose Gender"
              value={formData.gender}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {/* Add other form fields here... */}
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
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-2" aria-hidden="true" />
            <span className="text-red-500">{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          Sign Up
        </button>
      </form>
      </div>
    </div>
  );
};

export default SignupPage;