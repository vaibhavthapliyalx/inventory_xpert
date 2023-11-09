'use client';
import { useState, useEffect } from 'react';
import Router from 'next/navigation';
import axios from 'axios';
import './globals.css';

import { useRouter } from 'next/navigation';

const API_URL = "https://example.com/api";

export default function Page() {
  const router = useRouter();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(API_URL);
      setData(result.data);
    };
    fetchData();
  }, []);

  const handleClick = () => {
    router.push('/panel');
  };

  return (
    <div>
      <h1>Hello World!</h1>
      <button onClick={handleClick}>Go to Panel Page</button>
    </div>
  );
}