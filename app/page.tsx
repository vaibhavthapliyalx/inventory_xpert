"use client";
import { Card, Title, Text, Select, Table } from '@tremor/react';
import Search from './components/search';
import Slider from '@mui/material/Slider';
import CoreConnector from './InterfaceAPI/CoreConnector';
import { useEffect, useState } from 'react';
import { Admin,MembershipStatus,SortOrder, TableType } from './interface/CommonInterface';
import { useRouter } from 'next/navigation';
import Nav from './nav';
import CustomersTable from './components/tables/customer';
import OrdersTable from './components/tables/order';
import ProductsTable from './components/tables/products';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const coreConnectorInstance = CoreConnector.getInstance();

export default function Home({ searchParams } : { searchParams: {q?: string} }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin>();
  const [searchType, setSearchType] = useState<TableType>(TableType.Customer); // Added searchType state
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Ascending); // Added sortOrder state
  const [priceRange, setPriceRange] = useState([0, 100]); // Added priceRange state
  const [filter, setFilter] = useState<MembershipStatus|string>('All');

  // Get the admin details from the backend
  useEffect(() => {
    coreConnectorInstance.getLoggedInAdmin()
    .then((result) => {
      setAdmin(result);
    })
    .catch((error) => {
      console.log(error);
      // Redirect to login if the admin is not logged in
      router.push('/login');
    });

    return function cleanup() {
      setAdmin(undefined);
    }
  }, []);
  
  /**
   *  Renders the table based on the searchType.
   * @param tableType  The type of table to be rendered.
   * @returns  The table to be rendered.
   */
  function displayTables(tableType: TableType): React.ReactNode  {
    switch(tableType) {
      case TableType.Customer:
        return <CustomersTable searchParams={searchParams} filter={filter}/>;
      case TableType.Product:
        return (
          <ProductsTable searchParams={searchParams} priceRange={priceRange} sortOrder={sortOrder} />
        );
      case TableType.Order:
        return <OrdersTable searchParams={searchParams}/>;
      default:
        return <CustomersTable searchParams={searchParams} filter={filter} />;
    }
  }

  /**
   *  Updates the priceRange state when the slider is moved.
   * @param event  The event that triggered the change.
   * @param newValue  The new value of the slider i.e. Array of numbers.
   */
  const handleSliderChange = (event: any, newValue: number | number[]) => {
    console.log(newValue);
    setPriceRange(newValue as number[]);
  };

  function handleFilterChange(event: any) {
    const value = event.target.value;
    console.log(value);
    setFilter(event.target.value);
  }








  

  return (
    <>
      <Nav />
      <main className="p-4 md:p-10 mx-auto max-w-full">
        <Title className="text-6xl mb-4 text-center font-mono">Hello, {admin?.fullName} 👋</Title>
        <Text className="text-lg mb-6 text-center animate-pulse">
          Manage your inventory efficiently, search for products, and keep track of the latest updates.
        </Text>
       {/* Dashboard Summary Tiles */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         {/* Total Inventory Value */}
         <Card className="p-4 bg-white rounded-md shadow-md focus:ring focus:border focus:ring-indigo-500">
           <Title className="text-xl mb-2">Total Inventory Value</Title>
           <Text className="text-2xl font-bold">£{}/-</Text>
         </Card>        
         {/* Stock Status */}
         <Card className="p-4 bg-white rounded-md shadow-md focus:ring focus:border focus:ring-indigo-500">
           <Title className="text-xl mb-2">Stock Status</Title>
           <Text className="text-2xl font-bold">
             In Stock: {} | Low Stock: {} | Out of Stock: {}
           </Text>
         </Card>        
         {/* Top Selling Products */}
         <Card className="p-4 bg-white rounded-md shadow-md col-span-2 focus:ring focus:border focus:ring-indigo-500">
           <Title className="text-xl mb-2">Top Selling Products</Title>
           {/* Add a component to display top-selling products here */}
         </Card>
         </div>

        <div className="flex items-center justify-center mb-8">
          <div className="relative max-w-md w-full">
            <Search />
          </div>
          <select
            className="px-4 py-2 relative mt-5 border border-gray-300 rounded-md ml-2 focus:outline-none focus:ring focus:border focus:ring-indigo-500 align-middle"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as TableType)}
          >
            <option value={TableType.Customer}>Customers</option>
            <option value={TableType.Product}>Products</option>
            <option value={TableType.Order}>Orders</option>
          </select>
          
          {searchType === TableType.Customer ? (
            <select
            className="px-4 py-2 relative mt-5 border border-gray-300 rounded-md ml-2 focus:outline-none focus:ring focus:border focus:ring-indigo-500 align-middle"
            value={filter}
            onChange={handleFilterChange}
            >
              <option value={'All'}>All</option>
              <option value={MembershipStatus.Member}>Members</option>
              <option value={MembershipStatus.NonMember}>Non-Members</option>
            </select>
          ) : ( searchType === TableType.Product)  && (
          <Listbox value={sortOrder} onChange={setSortOrder}>
            {({ open }) => (
              <>
                <div className="relative">
                  <Listbox.Button className="px-4 py-2 mt-5 border border-gray-300 rounded-md ml-2 focus:outline-none focus:ring focus:border focus:ring-indigo-500 align-middle flex items-center">
                    Sort by: {sortOrder}
                    <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500" />
                  </Listbox.Button>
                  {open && (
                    <Listbox.Options className="absolute w-64 mt-1 origin-top-right z-99 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <Listbox.Option value={SortOrder.Ascending} className={({ active }) => `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'} cursor-pointer select-none relative py-2 pl-10 pr-4`}>
                        {({ selected, active }) => (
                          <>
                            <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
                              Price (Low to High)
                            </span>
                            {selected && (
                              <span className={`${active ? 'text-amber-600' : 'text-amber-600'} absolute inset-y-0 left-0 flex items-center pl-3`}>
                                <CheckIcon className="w-5 h-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                      <Listbox.Option value={SortOrder.Descending} className={({ active }) => `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'} cursor-pointer select-none relative py-2 pl-10 pr-4`}>
                        {({ selected, active }) => (
                          <>
                            <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
                              Price (High to Low)
                            </span>
                            {selected && (
                              <span className={`${active ? 'text-amber-600' : 'text-amber-600'} absolute inset-y-0 left-0 flex items-center pl-3`}>
                                <CheckIcon className="w-5 h-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                      {(searchType === TableType.Product || searchType === TableType.Order) && (
                        <Listbox.Option 
                          value="priceRange" 
                          className={ `cursor-pointer select-none relative py-2 pl-10 pr-4`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <div className="flex flex-col">
                            <label htmlFor="range-slider" className="mb-1 text-sm font-medium text-gray-700">Price Range</label>
                              <Slider
                                value={priceRange}
                                onChange={handleSliderChange}
                                valueLabelDisplay="auto"
                                aria-labelledby="range-slider"
                                min={0}
                                max={100}
                                className="mt-2"
                              />
                            <span className="text-sm text-gray-500">{`£${priceRange[0]} - £${priceRange[1]}`}</span>
                          </div>
                        </Listbox.Option>
                      )}
                    </Listbox.Options>
                  )}
                </div>
              </>
            )}  
          </Listbox>
          )}
        </div>
          
          {/* Display tables based on searchType */}
          {displayTables(searchType)}
      </main>
    </>
  );
}



