'use client';
import { Card, Title, Text } from '@tremor/react';
import Search from './search';
import UsersTable from './table';
import CoreConnector from './interfaces/CoreConnector';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export default function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  const search = searchParams.q ?? '';
  const [result, setResult] = useState<[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const result = await CoreConnector.getInstance().getAllCustomers();
  //     setResult(result);
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      const result = await CoreConnector.getInstance().findCustomerByName(search);
      console.log(result)
      setResult(result);
    };
     if (search != '') {
      fetchData();
     } else {
      const fetchData = async () => {
        const result = await CoreConnector.getInstance().getAllCustomers();
        setResult(result);
      };
      fetchData();
     }
  }, [searchParams]);
  // const result = await sql`
  //   SELECT id, name, username, email 
  //   FROM users 
  //   WHERE name ILIKE ${'%' + search + '%'};
  // `;
  const users = result;
  console.log("Users data retreieved from database");
  console.log(users);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Users</Title>
      <Text>A list of users retrieved from MongoDB database.</Text>
      <Search />
      <Card className="mt-6">
        <UsersTable users={users} />
      </Card>
    </main>
  );
}
