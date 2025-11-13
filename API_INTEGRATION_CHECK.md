# API Integration Checklist for Onboarding

## ✅ What I Fixed

1. **Added Validation** - Form now validates all required fields before submission
2. **Added Console Logging** - You can now see exactly what data is being sent in the browser console
3. **Better Error Handling** - More detailed error messages to help debug issues
4. **Response Status Check** - Verifies the server response is OK before processing

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the "Console" tab
3. Try submitting the onboarding form

### Step 2: Check Console Output
You should see:
```
Submitting to: http://localhost:5000/api/supplier/submit
Form Data: { companyName: "...", email: "...", ... }
Response status: 200
Response data: { success: true, ... }
```

### Step 3: Common Issues & Solutions

#### ❌ Issue: "Failed to fetch" or Network Error
**Solution:** 
- Make sure your backend server is running on `http://localhost:5000`
- Check if CORS is enabled on your backend
- Verify the API endpoint exists

#### ❌ Issue: Response status 404
**Solution:**
- The endpoint `/api/supplier/submit` doesn't exist
- Check your backend routes
- Verify the API_URL is correct

#### ❌ Issue: Response status 500
**Solution:**
- Server error - check your backend logs
- MongoDB connection might be down
- Check backend error handling

#### ❌ Issue: Data not saving to MongoDB
**Solution:**
- Check if MongoDB is running
- Verify MongoDB connection string in backend
- Check backend model/schema matches the data being sent
- Look at backend console for errors

## 📋 Data Being Sent

The form sends these fields:
```javascript
{
  companyName: string,
  email: string,
  phone: string,
  contactPerson: string,
  businessType: "business" | "individual",
  address: {
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },
  businessDescription: string,
  productsOffered: string (comma-separated),
  yearsInBusiness: number,
  
  // Files (as FormData)
  pan: File (required),
  gst: File (optional),
  cin: File (optional),
  businessLicense: File (optional),
  aadhaar: File (optional - for individuals),
  bankProof: File (optional)
}
```

## 🔧 Backend Requirements

Your backend endpoint should:
1. Accept `multipart/form-data` (for file uploads)
2. Parse the JSON strings for `address` and `productsOffered`
3. Save files to storage (local/cloud)
4. Save data to MongoDB
5. Return `{ success: true, message: "..." }` on success

## 🧪 Test the API Manually

Use this curl command to test:
```bash
curl -X POST http://localhost:5000/api/supplier/submit \
  -F "companyName=Test Company" \
  -F "email=test@example.com" \
  -F "phone=1234567890" \
  -F "contactPerson=John Doe" \
  -F "businessType=business" \
  -F "address={\"street\":\"123 Main St\",\"city\":\"Mumbai\",\"state\":\"MH\",\"pincode\":\"400001\",\"country\":\"India\"}" \
  -F "businessDescription=Test description" \
  -F "productsOffered=[\"Product1\",\"Product2\"]" \
  -F "yearsInBusiness=5" \
  -F "pan=@/path/to/pan.pdf"
```

## 📞 Next Steps

1. **Check Browser Console** - Look for the logs I added
2. **Check Backend Logs** - See if the request is reaching your server
3. **Check MongoDB** - Verify if data is being saved
4. **Share Error Messages** - If you see errors, share them so I can help fix

The API integration is correct on the frontend. If data isn't reaching MongoDB, the issue is likely in the backend.
