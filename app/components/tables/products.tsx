// This file contains the component for the products table.

// Directive to use client side rendering.
'use client';

// Imports
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@mui/material';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell} from '@tremor/react';
import ApiConnector from '@/app/ApiConnector/ApiConnector';
import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { getProductCategoriesList } from '@/app/utils/utilityfunctions';
import { SortOrder } from '@/app/Shared/Enums';

// Grabs the instance of the ApiConnector Class (Singleton) which connects to the backend endpoints.
const apiConnectorInstance = ApiConnector.getInstance();

/**
 * This function renders the products table.
 * 
 * @param searchParams  The search query.
 * @param priceRange The price range.
 * @param sortOrder The sort order.
 * @returns ProductsTable Component.
 */
export default function ProductsTable({ searchParams, priceRange, sortOrder }: { searchParams: { q?: string }, priceRange: number[], sortOrder: SortOrder}) {
  // State variables.
  const [products, setProducts] = useState<any[]>([]);
  const initialSelectedCategories = getProductCategoriesList().reduce((categories, category) => {
    categories[category] = true;
    return categories;
  }, {} as { [key: string]: boolean });

  const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories);


  // Set up the data to be displayed in the table on initial render.
  useEffect(() => {
    const fetchData = async () => {
      let  result = await apiConnectorInstance.getAllProducts();
      if (sortOrder !== undefined) {
        result = await apiConnectorInstance.getProductsSortedByPrice(sortOrder);
      }
      setProducts(result);
    };
    fetchData();
  }, []);

  // This useEffect hook is responsible for fetching and setting the product data based on search params.
  useEffect(() => {
    // Define an async function to fetch data.
    const fetchData = async () => {
      let result: any[] = [];
      // If there is a search query, search for products by name.
      if (searchParams.q && searchParams.q.length > 0) {
        result = await apiConnectorInstance.searchProductsByName(searchParams.q ?? '');
      } 
      // If there is a price range, find products within that price range.
      else if (priceRange[0] !== 0 || priceRange[1] !== 100) {
        result = await apiConnectorInstance.findProductsWithinPriceRange(priceRange[0], priceRange[1]);
      } 

      // If there are no selected categories, get all products.
      else {
        result = await apiConnectorInstance.getAllProducts();
      }

      // Set the fetched products.
      setProducts(result);
    };

    fetchData();

    // Cleanup function to reset the products when the component unmounts.
    return function cleanup() {
      setProducts([]);
    }
  }, [searchParams, priceRange]);

  // This useEffect hook is responsible for fetching and setting the product data based on the sortOrder.
  useEffect(() => {
    // If there is a sort order, get products sorted by price.
    if (sortOrder !== undefined) {
      apiConnectorInstance.getProductsSortedByPrice(sortOrder)
      .then((result) => {
        setProducts(result);
      })
      .catch((error) => {
        console.log(error);
      });
    } 
      
  }, [sortOrder]);

  // This useEffect hook is responsible for fetching and setting the product data based on the selected categories.
  useEffect(() => {
    // Get the list of selected categories.
    const selectedCategoriesList = Object.keys(selectedCategories).filter((category) => selectedCategories[category]);
    // If there are selected categories, find products by category.
    if (selectedCategoriesList.length > 0) {
      apiConnectorInstance.findProductsByCategory(selectedCategoriesList)
      .then((result) => {
        setProducts(result);
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      // If there are no selected categories, dont show any products.
      setProducts([]);
    }
  }, [selectedCategories]);

  /**
   * This function handles the change in the checkbox for the categories.
   * @param event The event object.
   */
  function handleCategoryChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log( [event.target.name], event.target.checked );
    setSelectedCategories({ ...selectedCategories, [event.target.name]: event.target.checked });
  }

  /********************** Render Function **********************/
  return (
    <div className="w-full flex">
      <Card className="ml-2 mr-4 bg-gray-100 border border-gray-200">
        <CardContent className='bg-gray-50'>
          <FormControl component="fieldset">
          <FormLabel component="legend" className='p-3'>Categories</FormLabel>
            <FormGroup>
              {getProductCategoriesList().map((category, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedCategories[category]}
                      onChange={handleCategoryChange}
                      name={category}
                    />
                  }
                  label={category}
                />
              ))}
            </FormGroup>
          </FormControl>
        </CardContent>
      </Card>
      <Table className="w-full border border-gray-300">
        <TableHead>
          <TableRow className="bg-gray-100">
            <TableHeaderCell className="p-3">Product ID</TableHeaderCell>
            <TableHeaderCell className="p-3">Name</TableHeaderCell>
            <TableHeaderCell className="p-3">Category</TableHeaderCell>
            <TableHeaderCell className="p-3">Price</TableHeaderCell>
            <TableHeaderCell className="p-3">Stock</TableHeaderCell>
            <TableHeaderCell className="p-3">Description</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-gray-50">
              <TableCell className="p-3">{product.id}</TableCell>
              <TableCell className="p-3">{product.name}</TableCell>
                <TableCell className="p-3">{product.category}</TableCell>
              <TableCell className="p-3">£{product.price}</TableCell>
              <TableCell className="p-3">{product.stockQuantity}</TableCell>
                <TableCell className="p-3">{product.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


