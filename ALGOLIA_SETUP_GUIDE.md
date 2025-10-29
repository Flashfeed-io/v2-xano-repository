# Algolia Setup Guide

## Overview
This guide will help you recreate your Algolia index and configuration after data loss.

## Your API Credentials
- **Application ID**: `CZ13W7HFT4`
- **Search API Key**: `049015a3cf5e98d32ebed63d7aa83b10`
- **Write API Key**: `2ff95fd5b2008b1f675552d3b05e4174` (use with caution)

## Step 1: Create Index

1. Log into your Algolia dashboard
2. Navigate to **Indices** section
3. Click **Create Index**
4. Name it: `ads`

## Step 2: Configure Index Settings

### Searchable Attributes
Set these attributes as searchable (in order of importance):

1. `brand_name`
2. `industry`
3. Other text fields you want to search

**How to set:**
- Go to Index → Configuration → Searchable attributes
- Add each attribute in the order listed above

### Facets (for Filtering)
Configure these attributes as facets:

1. `genres` - Used for platform filtering
2. `industry` - Used for industry filtering

**How to set:**
- Go to Index → Configuration → Facets
- Add both attributes as **searchable facets**

### Attributes for Faceting
Add these to "Attributes for faceting":
- `genres`
- `industry`

## Step 3: Required Data Structure

Each record in your `ads` index should have the following structure:

```json
{
  "objectID": "unique_id_here",
  "id": 123,
  "brand_name": "Brand Name",
  "brand_image": "https://example.com/image.png",
  "industry": "Education",
  "video_url": "https://example.com/video.mp4",
  "genres": ["Instagram", "TikTok"],
  "platform": "Instagram",
  "run_time": "< 30 days",
  "purpose": "Direct Response",
  "score": "Legendary",
  "comments": "High",
  "likes": 10
}
```

### Required Fields:
- `objectID` - Unique identifier (Algolia requirement)
- `id` - Your internal ad ID
- `brand_name` - Brand name (string)
- `brand_image` - URL to brand logo (string)
- `industry` - Industry category (string)
- `video_url` - URL to video file (string)
- `genres` - Array of platforms (array of strings)

### Optional Fields (but used in your UI):
- `platform` - Primary platform (string)
- `run_time` - How long ad has been running (string)
- `purpose` - Ad purpose (string)
- `score` - Quality score (string)
- `comments` - Comment level (string)
- `likes` - Number of likes (number)

## Step 4: Upload Your Data

You have several options to upload data:

### Option A: Using Algolia Dashboard
1. Go to your `ads` index
2. Click **Add records**
3. Upload JSON file or paste JSON data
4. Click **Save**

### Option B: Using Algolia API
Use the Write API Key to programmatically upload records.

Example using JavaScript:
```javascript
const algoliasearch = require('algoliasearch');

const client = algoliasearch('CZ13W7HFT4', '2ff95fd5b2008b1f675552d3b05e4174');
const index = client.initIndex('ads');

const records = [
  {
    objectID: '1',
    id: 1,
    brand_name: 'Example Brand',
    brand_image: 'https://example.com/logo.png',
    industry: 'Education',
    video_url: 'https://example.com/video.mp4',
    genres: ['Instagram', 'TikTok']
  }
  // ... more records
];

index.saveObjects(records).then(({ objectIDs }) => {
  console.log('Uploaded:', objectIDs);
});
```

### Option C: Import from Database
If you have your ad data in a database (like Xano), you can:
1. Export the data as JSON
2. Transform it to match the required structure
3. Upload using Option A or B

## Step 5: Verify Configuration

After setting up, verify:

1. **Index exists**: Check that `ads` index is visible in dashboard
2. **Records uploaded**: Verify records appear in the index
3. **Facets configured**: Confirm `genres` and `industry` are set as facets
4. **Searchable attributes**: Verify searchable attributes are configured

## Step 6: Test Your Application

1. Run your application
2. Navigate to the ad library page
3. Test:
   - Search functionality
   - Platform filter (genres)
   - Industry filter
   - Load more functionality
   - Video display

## Troubleshooting

### No results showing
- Check that records exist in the index
- Verify API keys are correct
- Check browser console for errors

### Filters not working
- Ensure `genres` and `industry` are configured as facets
- Check that your records have these fields populated

### Search not working
- Verify searchable attributes are configured
- Check that `brand_name` and other text fields have data

## Code Changes Made

The following files have been updated with your new API credentials:
- `src/pages/app/ad-library.js` - Main ad library page
- `src/pages/app/test-algolia.js` - Test file

## Security Notes

⚠️ **Important**: 
- The **Search API Key** is safe to use in frontend code
- The **Write API Key** should NEVER be exposed in frontend code
- Only use the Write API Key in backend/server-side code
- Consider creating a secured API key with restrictions for production

## Next Steps

1. ✅ API credentials updated in code
2. ⏳ Create `ads` index in Algolia dashboard
3. ⏳ Configure facets and searchable attributes
4. ⏳ Upload your ad data
5. ⏳ Test the application

## Support Resources

- [Algolia Documentation](https://www.algolia.com/doc/)
- [InstantSearch.js Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/)
- [Algolia Dashboard](https://www.algolia.com/dashboard)
