import { useState, useEffect } from 'react'
import { productsAPI, categoriesAPI } from '../../services/api'

const ApiTest = () => {
  const [testResults, setTestResults] = useState({
    featuredProducts: null,
    categories: null,
    products: null,
    loading: true
  })

  useEffect(() => {
    const runTests = async () => {
      console.log('ApiTest: Starting API tests...')
      
      try {
        // Test featured products
        console.log('Testing featured products API...')
        const featuredResponse = await productsAPI.getFeaturedProducts()
        console.log('Featured products response:', featuredResponse)
        
        // Test categories
        console.log('Testing categories API...')
        const categoriesResponse = await categoriesAPI.getCategories()
        console.log('Categories response:', categoriesResponse)
        
        // Test products
        console.log('Testing products API...')
        const productsResponse = await productsAPI.getProducts()
        console.log('Products response:', productsResponse)
        
        setTestResults({
          featuredProducts: featuredResponse.data,
          categories: categoriesResponse.data,
          products: productsResponse.data,
          loading: false
        })
        
      } catch (error) {
        console.error('API Test failed:', error)
        setTestResults(prev => ({ ...prev, loading: false, error: error.message }))
      }
    }
    
    runTests()
  }, [])

  if (testResults.loading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">Testing APIs...</div>
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded">
      <h3 className="font-bold mb-4">API Test Results</h3>
      
      {testResults.error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 rounded text-red-700">
          Error: {testResults.error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Featured Products:</h4>
          <p>Count: {testResults.featuredProducts?.products?.length || 0}</p>
        </div>
        
        <div>
          <h4 className="font-semibold">Categories:</h4>
          <p>Count: {testResults.categories?.categories?.length || 0}</p>
        </div>
        
        <div>
          <h4 className="font-semibold">Products:</h4>
          <p>Count: {testResults.products?.products?.length || 0}</p>
          <p>Pagination: {JSON.stringify(testResults.products?.pagination)}</p>
        </div>
      </div>
    </div>
  )
}

export default ApiTest
