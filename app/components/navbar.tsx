// This file contains the navbar component.

// Directive to use client side rendering.
'use client';

// Imports
import { Fragment } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import {getProfilePhoto} from '../utils/utilityfunctions';
import { Admin } from '../Shared/Interfaces';

// Navigation links.
const navigation = [{ name: 'Dashboard', href: '/' }];

// This function returns a string of class names.
// This is helpful for conditionally rendering classes.
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Renders the navbar component.
 * 
 * @param admin Current logged in admin.
 * @returns The rendered navbar component.
 */
export default function Navbar({ admin, onLogout }: { admin: Admin | undefined, onLogout: () => void }) {  
  
  // Uses the usePathname hook to get the current path.
  const pathname = usePathname();

  // Uses the useRouter hook to get the router object.
  // This is helpful for redirecting the user to a different page by its path.
  const router = useRouter();

  // Gets the profile photo of the admin from the utility function
  // Which returns placeholder image based on admin's gender.
  const profilePhoto = getProfilePhoto(admin);
  
  /********************** Render Function **********************/
  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {() => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Image
                  src={require('../../public/assets/logo_stretched.png')}
                  alt="Logo"
                  width={100}
                  height={90}
                  className="mx-0 h-auto w-auto my-4 place-content-start"
                />
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? 'border-slate-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                      <span className="sr-only">Open admin menu</span>
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={profilePhoto}
                        height={32}
                        width={32}
                        alt={`${admin?.username || 'placeholder'} avatar`}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {admin ? (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full px-4 py-2 text-sm text-gray-700'
                              )}
                              onClick={onLogout}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      ) : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full px-4 py-2 text-sm text-gray-700'
                              )}
                              onClick={() => router.push('/login')}
                            >
                              Sign in
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                </Disclosure.Button>
              </div>
            </div>
          </div>
      </>
      )}
    </Disclosure>
  );
}
