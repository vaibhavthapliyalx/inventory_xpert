'use client';
import { Card, Title, Text } from '@tremor/react';
import Search from './components/search';
import UsersTable from './components/table';
import CoreConnector from './InterfaceAPI/CoreConnector';
import { useEffect, useState } from 'react';
import { Admin, Customer } from './interface/CommonInterface';
import { useRouter } from 'next/navigation';
import Nav from './nav';

const coreConnectorInstance = CoreConnector.getInstance();

export default function Home(
  { searchParams } : { searchParams: {
    q?: string;
  } }
) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin>();

  // Redirect user to login page if not logged in
  useEffect(() => {
    async function checkLoggedIn() {
      coreConnectorInstance.getLoggedInAdmin()
      .then((result) => {
        console.log(result);
        setAdmin(result);
      })
      .catch((error) => {
        router.push('/login');
        setAdmin({} as Admin);
      });
    }
    checkLoggedIn();
  }, []);

  const search = searchParams.q ?? '';
  const [result, setResult] = useState<Customer[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      const result = await CoreConnector.getInstance().searchCustomerByName(search);
      console.log(result)
      setResult(result);
    };
     if (search != '') {
      fetchData();
     } else {
      const fetchData = async () => {
        const result : Customer[] = await CoreConnector.getInstance().getAllCustomers();
        setResult(result);
      };
      fetchData();
     }
  }, [searchParams]);

  return (
    <>
    <Nav/>
    <main className="p-4 md:p-10 mx-auto max-w-full">
    <Title className="text-5xl mb-4 text-center">Welcome, {admin?.fullName}</Title>
      <Text className="text-lg mb-6 text-center animate-pulse">
        Manage your inventory efficiently, search for products, and keep track of the latest updates.
      </Text>

      <div className="flex items-center justify-center mb-8">
        <div className="relative max-w-md w-full">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
         <Search/>
      </div>
      </div>

      <Card className="max-w-7xl mx-auto mb-8 p-8">
        <UsersTable customers={result} />
      </Card>
    </main>
    </>
  );
}

{/* <>
    <Nav/>
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Inventory Dashboard</h1>

      <div className="mb-8 flex items-center justify-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-500 flex-1"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-500"
        >
          <StarIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-8 flex items-center justify-center space-x-4">
        <label className="text-lg">Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
        >
          <option value="">-- Select --</option>
          <option value="asc">Alphabetical (A-Z)</option>
          <option value="desc">Alphabetical (Z-A)</option>
        </select>
        <button
          onClick={handleSort}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-500"
        >
          {sortBy === 'asc' ? (
            <ChevronDownIcon className="h-5 w-5" />
          ) : (
            <ChevronUpIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <ul>
            {products.map((product) => (
              <li key={product._id} className="mb-2">
                {product.name} - ${product.price.toFixed(2)} - {product.stock_quantity} in stock
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">Customers</h2>
          <ul>
            {customers.map((customer) => (
              <li key={customer._id} className="mb-2">
                {customer.name} - {customer.contact.email} - {customer.membership_status}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">Orders</h2>
          <ul>
            { orders.map((order) => (
              <li key={order._id} className="mb-2">
                Order ID: {order._id} - Customer ID: {order.customer_id} - Total Price: ${order.total_price.toFixed(2)} - {order.delivery_status}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </main>
    </> */}