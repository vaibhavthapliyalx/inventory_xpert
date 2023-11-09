'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../globals.css';

const API_URL = '/api'; // Replace with your Flask API URL

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [queryType, setQueryType] = useState<string>('test');
  const [isDatabaseConnected, setDatabaseConnected] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Check the database connectivity status here
    axios.get(`${API_URL}/db_connectivity`)
      .then((res) => {
        if (res.status === 200) {
          setDatabaseConnected(true);
        } else {
          setDatabaseConnected(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setDatabaseConnected(false);
      });

    // Check if the user is authenticated (you can implement your own authentication logic)
    axios.get('/api/check-auth')
      .then((res) => {
        if (res.data.authenticated) {
          setUser(res.data.username);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  function handleTestQuery() {
    setResults([]);
    try {
      axios.get(`${API_URL}/${queryType}`)
        .then((response) => {
          setResults([response.data]);
        })
        .catch((error) => {
          console.error('Error testing the query:', error);
        });
    } catch (error) {
      console.error('Error testing the query:', error);
      setResults([]);
    }
  }

  const handleLogin = () => {
    // You can implement your own authentication logic here
    // For example, sending a POST request with credentials to your Flask API
    axios.post('/api/login', { username: 'your_username', password: 'your_password' })
      .then((res) => {
        if (res.data.success) {
          setUser('your_username');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleLogout = () => {
    // You can implement your own logout logic here
    // For example, sending a POST request to your Flask API to log the user out
    axios.post('/api/logout')
      .then((res) => {
        if (res.data.success) {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-row mx-auto p-5">
        <label className="font-semibold">Database Connected:</label>
        <span
          className={`ml-2 h-4 w-4 rounded-full inline-block ${
            isDatabaseConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
      </div>
      <h2>API ROUTE: {API_URL}/{queryType}</h2>
      {user ? (
        <div className="mb-4">
          <label className="font-semibold">Logged in as: {user}</label>
          <button
            className="ml-4 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          className="mb-4 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 cursor-pointer"
          onClick={handleLogin}
        >
          Login
        </button>
      )}
      <h1 className="text-2xl font-semibold mb-4">Inventory Expert Query Tester</h1>
      <label className="font-semibold">Select a Query Type:</label>
      <select
        className="block select w-auto p-2 mt-2 border rounded mx-auto"
        onChange={(e) => setQueryType(e.target.value)}
      >
        <option value="test">Test API Endpoint</option>
        <option value="get-all-documents">Get All Documents</option>
        <option value="select-necessary-fields">Select Necessary Fields</option>
        <option value="match-values-in-array">Match Values in an Array</option>
        <option value="match-array-elements-multiple-criteria">Match Array Elements with Multiple Criteria</option>
        <option value="match-arrays-containing-elements">Match Arrays Containing Elements</option>
        <option value="iterate-over-result-sets">Iterate Over Result Sets</option>
        <option value="query-embedded-documents-arrays">Query Embedded Documents and Arrays</option>
        <option value="match-elements-in-arrays-criteria">Match Elements in Arrays with Criteria</option>
        <option value="match-arrays-with-all-elements">Match Arrays with All Elements Specified</option>
        <option value="perform-text-search">Perform Text Search</option>
        <option value="perform-left-outer-join">Perform Left Outer Join</option>
        <option value="data-transformations">Data Transformations</option>
        <option value="deconstruct-array">Deconstruct Array into Separate Documents</option>
        <option value="map-reduce">MapReduce</option>
        <option value="aggregation">Aggregation Expressions</option>
        <option value="conditional-update">Conditional Update</option>
      </select>
      <button
        className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 cursor-pointer"
        onClick={handleTestQuery}
      >
        Test Query
      </button>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Results:</h3>
        <pre
          className="p-2 bg-auto border-spacing-1 box-border rounded"
          style={{ maxHeight: '200px', overflowY: 'auto' }}
        >
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
}
