# Backend API Example for Supplier Onboarding

## Expected Backend Endpoint

Your backend should have this endpoint: `POST /api/supplier/submit`

## Example Backend Code (Node.js/Express)

```javascript
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/supplier-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Supplier Schema
const supplierSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  contactPerson: { type: String, required: true },
  businessType: { type: String, enum: ['business', 'individual'], required: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  businessDescription: { type: String, required: true },
  productsOffered: [String],
  yearsInBusiness: { type: Number, required: true },
  documents: {
    pan: String,
    gst: String,
    cin: String,
    businessLicense: String,
    aadhaar: String,
    bankProof: String
  },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  createdAt: { type: Date, default: Date.now }
});

const Supplier = mongoose.model('Supplier', supplierSchema);

// API Endpoint
router.post('/supplier/submit', upload.fields([
  { name: 'pan', maxCount: 1 },
  { name: 'gst', maxCount: 1 },
  { name: 'cin', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received supplier submission:', req.body);
    console.log('Files:', req.files);

    // Parse JSON fields
    const address = JSON.parse(req.body.address);
    const productsOffered = JSON.parse(req.body.productsOffered);

    // Prepare document paths
    const documents = {};
    if (req.files) {
      if (req.files.pan) documents.pan = req.files.pan[0].path;
      if (req.files.gst) documents.gst = req.files.gst[0].path;
      if (req.files.cin) documents.cin = req.files.cin[0].path;
      if (req.files.businessLicense) documents.businessLicense = req.files.businessLicense[0].path;
      if (req.files.aadhaar) documents.aadhaar = req.files.aadhaar[0].path;
      if (req.files.bankProof) documents.bankProof = req.files.bankProof[0].path;
    }

    // Create supplier record
    const supplier = new Supplier({
      companyName: req.body.companyName,
      email: req.body.email,
      phone: req.body.phone,
      contactPerson: req.body.contactPerson,
      businessType: req.body.businessType,
      address: address,
      businessDescription: req.body.businessDescription,
      productsOffered: productsOffered,
      yearsInBusiness: parseInt(req.body.yearsInBusiness),
      documents: documents,
      status: 'pending'
    });

    // Save to MongoDB
    await supplier.save();

    console.log('Supplier saved successfully:', supplier._id);

    // Send success response
    res.json({
      success: true,
      message: 'Application submitted successfully',
      supplierId: supplier._id
    });

  } catch (error) {
    console.error('Error saving supplier:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application'
    });
  }
});

module.exports = router;
```

## CORS Configuration

Make sure CORS is enabled in your backend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
```

## MongoDB Connection

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/supplier-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
```

## Required npm Packages

```bash
npm install express mongoose multer cors
```

## Folder Structure

```
backend/
├── uploads/
│   └── supplier-documents/  (create this folder)
├── models/
│   └── Supplier.js
├── routes/
│   └── supplier.js
└── server.js
```

## Testing Checklist

1. ✅ Backend server running on port 5000
2. ✅ MongoDB running and connected
3. ✅ CORS enabled for frontend URL
4. ✅ Multer configured for file uploads
5. ✅ Upload folder exists and has write permissions
6. ✅ Supplier model/schema defined
7. ✅ Route registered in main app

## Common Backend Errors

### Error: "Cannot POST /api/supplier/submit"
- Route not registered in main app
- Check if you're using `app.use('/api', supplierRoutes)`

### Error: "Unexpected field"
- Multer field names don't match frontend
- Check `upload.fields([...])` configuration

### Error: "File too large"
- Increase multer file size limit
- Current limit: 5MB per file

### Error: "Duplicate key error"
- Email already exists in database
- Add unique email validation

## Verify Data in MongoDB

```bash
# Connect to MongoDB
mongo

# Use your database
use supplier-portal

# Check suppliers collection
db.suppliers.find().pretty()

# Count documents
db.suppliers.count()

# Find by email
db.suppliers.findOne({ email: "test@example.com" })
```
