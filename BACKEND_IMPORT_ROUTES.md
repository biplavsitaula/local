# Backend Import Routes Implementation Guide

This document describes the backend routes that need to be implemented to support the product import feature.

## Routes

### 1. Download Template Route
**GET** `/import/template`

- **Access**: Admin and Super Admin
- **Purpose**: Download an Excel template file for product import
- **Authentication**: Required (use `authenticate` middleware)
- **Authorization**: Admin and Super Admin only

**Implementation Example (Express.js):**

```javascript
const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { authenticate } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/roleCheck');

// Download template (admin and super_admin)
router.get("/import/template", authenticate, checkAdmin, downloadProductTemplate);

async function downloadProductTemplate(req, res) {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Define headers for the template
    const headers = [
      '_id',           // Optional: Product ID (for updates)
      'name',          // Required: Product name
      'category',      // Required: Category (must match existing categories)
      'brand',         // Optional: Brand name
      'price',         // Required: Product price
      'discountPercent', // Optional: Discount percentage (0-100)
      'stock',         // Required: Stock quantity
      'imageUrl',      // Optional: Image URL
      'description',   // Optional: Product description
      'rating',        // Optional: Rating (0-5)
      'tag',           // Optional: Product tag
      'isRecommended', // Optional: Is recommended (true/false)
      'alcoholPercentage', // Optional: Alcohol percentage
      'volume',        // Optional: Volume (e.g., "750ml")
    ];
    
    // Create sample data row (for reference)
    const sampleData = [
      {
        '_id': '', // Leave empty for new products, or provide ID for updates
        'name': 'Sample Product',
        'category': 'whiskey', // Must match existing category
        'brand': 'Sample Brand',
        'price': 99.99,
        'discountPercent': 10,
        'stock': 50,
        'imageUrl': 'https://example.com/image.jpg',
        'description': 'Sample product description',
        'rating': 4.5,
        'tag': 'New',
        'isRecommended': false,
        'alcoholPercentage': 40,
        'volume': '750ml',
      }
    ];
    
    // Create worksheet with headers and sample data
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    
    // Set column widths
    const columnWidths = [
      { wch: 30 }, // _id
      { wch: 25 }, // name
      { wch: 15 }, // category
      { wch: 20 }, // brand
      { wch: 12 }, // price
      { wch: 15 }, // discountPercent
      { wch: 10 }, // stock
      { wch: 40 }, // imageUrl
      { wch: 50 }, // description
      { wch: 10 }, // rating
      { wch: 15 }, // tag
      { wch: 15 }, // isRecommended
      { wch: 18 }, // alcoholPercentage
      { wch: 12 }, // volume
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=product-import-template.xlsx');
    
    // Send file
    res.send(buffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message,
    });
  }
}
```

### 2. Import Products Route
**POST** `/import/products`

- **Access**: Super Admin only
- **Purpose**: Import products from uploaded Excel file
- **Authentication**: Required (use `authenticate` middleware)
- **Authorization**: Super Admin only (use `checkSuperAdmin` middleware)
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field containing Excel file

**Implementation Example (Express.js with multer):**

```javascript
const multer = require('multer');
const XLSX = require('xlsx');
const Product = require('../models/Product'); // Your Product model

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'));
    }
  },
});

// Import products (super_admin only)
router.post("/import/products", authenticate, checkSuperAdmin, upload.single('file'), importProductsFromExcel);

async function importProductsFromExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or invalid',
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have a header

      try {
        // Validate required fields
        if (!row.name || !row.category || row.price === undefined || row.stock === undefined) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            product: row.name || 'Unknown',
            error: 'Missing required fields: name, category, price, or stock',
          });
          continue;
        }

        // Prepare product data
        const productData = {
          name: String(row.name).trim(),
          category: String(row.category).toLowerCase().trim(),
          price: parseFloat(row.price),
          stock: parseInt(row.stock),
        };

        // Add optional fields
        if (row.brand) productData.brand = String(row.brand).trim();
        if (row.description) productData.description = String(row.description).trim();
        if (row.imageUrl) productData.imageUrl = String(row.imageUrl).trim();
        if (row.tag) productData.tag = String(row.tag).trim();
        if (row.volume) productData.volume = String(row.volume).trim();
        
        // Handle numeric fields
        if (row.discountPercent !== undefined) {
          productData.discountPercent = parseFloat(row.discountPercent) || 0;
        }
        if (row.rating !== undefined) {
          productData.rating = parseFloat(row.rating) || 0;
        }
        if (row.alcoholPercentage !== undefined) {
          productData.alcoholPercentage = parseFloat(row.alcoholPercentage);
        }
        
        // Handle boolean fields
        if (row.isRecommended !== undefined) {
          productData.isRecommended = String(row.isRecommended).toLowerCase() === 'true';
        }

        // Calculate discount amount and final price
        if (productData.discountPercent > 0) {
          productData.discountAmount = (productData.price * productData.discountPercent) / 100;
          productData.finalPrice = productData.price - productData.discountAmount;
        } else {
          productData.discountAmount = 0;
          productData.finalPrice = productData.price;
        }

        // Determine stock status
        if (productData.stock <= 0) {
          productData.status = 'Out of Stock';
        } else if (productData.stock < 10) {
          productData.status = 'Low Stock';
        } else {
          productData.status = 'In Stock';
        }

        // Check if product exists (update) or create new
        if (row._id && row._id.trim() !== '') {
          // Update existing product
          const existingProduct = await Product.findById(row._id);
          if (!existingProduct) {
            results.failed++;
            results.errors.push({
              row: rowNumber,
              product: productData.name,
              error: `Product with ID ${row._id} not found`,
            });
            continue;
          }

          // Update product
          Object.assign(existingProduct, productData);
          await existingProduct.save();
          results.success++;
        } else {
          // Create new product
          const newProduct = new Product(productData);
          await newProduct.save();
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          product: row.name || 'Unknown',
          error: error.message || 'Unknown error',
        });
      }
    }

    // Return results
    res.json({
      success: true,
      message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
      data: results,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import products',
      error: error.message,
    });
  }
}
```

## Middleware Requirements

### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
```

### Role Check Middleware
```javascript
// middleware/roleCheck.js

function checkAdmin(req, res, next) {
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
}

function checkSuperAdmin(req, res, next) {
  if (req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  }
}
```

## Excel Template Format

The template should include the following columns:

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| _id | No | String | Product ID (for updates). Leave empty for new products. |
| name | Yes | String | Product name |
| category | Yes | String | Category name (must match existing categories) |
| brand | No | String | Brand name |
| price | Yes | Number | Product price |
| discountPercent | No | Number | Discount percentage (0-100) |
| stock | Yes | Number | Stock quantity |
| imageUrl | No | String | Product image URL |
| description | No | String | Product description |
| rating | No | Number | Product rating (0-5) |
| tag | No | String | Product tag |
| isRecommended | No | Boolean | Is recommended (true/false) |
| alcoholPercentage | No | Number | Alcohol percentage |
| volume | No | String | Volume (e.g., "750ml") |

## Notes

1. **Category Validation**: The backend should validate that the category exists in the database before creating/updating products.

2. **Price Calculations**: The backend should automatically calculate `discountAmount` and `finalPrice` based on `price` and `discountPercent`.

3. **Stock Status**: The backend should automatically set `status` based on stock quantity:
   - `stock <= 0`: "Out of Stock"
   - `stock < 10`: "Low Stock"
   - `stock >= 10`: "In Stock"

4. **Error Handling**: The import should continue processing even if some rows fail, and return detailed error information for failed rows.

5. **File Size Limit**: Maximum file size should be 10MB.

6. **File Type Validation**: Only `.xlsx` and `.xls` files should be accepted.

## Dependencies

Install required npm packages:

```bash
npm install xlsx multer
```

## Testing

Test the routes using:

1. **Download Template:**
   ```bash
   curl -X GET http://localhost:3000/api/import/template \
     -H "Authorization: Bearer YOUR_TOKEN" \
     --output template.xlsx
   ```

2. **Import Products:**
   ```bash
   curl -X POST http://localhost:3000/api/import/products \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@products.xlsx"
   ```
















