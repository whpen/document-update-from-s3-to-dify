const AWS = require('aws-sdk');
const axios = require('axios');

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET;

exports.lambda_handler = async (event, context) => {
    console.log('Starting S3 sync process');
  
    try {
      // Log environment variables (for debugging)
      console.log('Environment variables:');
      console.log('DIFY_API_BASE_URL:', process.env.DIFY_API_BASE_URL);
      console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
  
      // Test API connectivity
      const isApiConnected = await testApiConnectivity();
      if (!isApiConnected) {
        throw new Error('Unable to connect to the Dify API. Please check your internet connection and API configuration.');
      }
  
      // Find or create the Knowledge base
      const datasetId = await findOrCreateDataset(bucketName);
  
      // Get existing documents in the dataset
      const existingDocs = await getExistingDocuments(datasetId);
      console.log('Found', existingDocs.length, 'existing documents in the dataset');
  
      // Process S3 events
      for (const record of event.Records) {
        const encodedKey = record.s3.object.key;
        const objectKey = decodeS3Key(encodedKey);
        const eventName = record.eventName;
        
        console.log('Processing object:', objectKey, 'Event:', eventName);
        console.log('Encoded key:', encodedKey);
        console.log('Decoded key:', objectKey);

        try {
          const existingDoc = existingDocs.find(d => d.name === objectKey);

          if (eventName.startsWith('ObjectCreated')) {
            await processCreatedObject(objectKey, existingDoc, datasetId);
          } else if (eventName.startsWith('ObjectRemoved')) {
            await processRemovedObject(objectKey, existingDoc, datasetId);
          }
        } catch (error) {
          console.error(`Error processing object ${objectKey}:`, error);
          if (error.response) {
            console.error('Error response from Dify API:', JSON.stringify(error.response.data, null, 2));
          }
        }
      }
  
      console.log('Sync completed successfully');
      return { statusCode: 200, body: JSON.stringify('Sync completed successfully!') };
    } catch (error) {
      console.error('Error during sync:', error);
      return { statusCode: 500, body: JSON.stringify(`Error during sync: ${error.message}`) };
    }
};

function decodeS3Key(encodedKey) {
  return decodeURIComponent(encodedKey.replace(/\+/g, ' '));
}

async function processCreatedObject(objectKey, existingDoc, datasetId) {
  console.log('Attempting to download file from S3, objectKey:', objectKey);
  try {
    const file = await s3.getObject({ Bucket: bucketName, Key: objectKey }).promise();
    
    console.log('File downloaded. Uploading to Dify.');
    const fileBlob = new Blob([file.Body]);
    const formData = new FormData();
    formData.append('file', fileBlob, objectKey);
    console.log('Filename being sent to Dify:', objectKey);
    const dataJson = JSON.stringify({
      indexing_technique: 'high_quality',
      process_rule: {
        mode: 'automatic'
      }
    });
    formData.append('data', dataJson);
    console.log('Data being sent to Dify:', dataJson);

    const headers = {
      'Authorization': `Bearer ${process.env.DIFY_API_KNOWLEDGE_KEY}`,
      'Content-Type': 'multipart/form-data'
    };
    console.log('Request headers:', JSON.stringify(headers, null, 2));

    let response;
    if (existingDoc) {
      console.log('Updating existing document:', existingDoc.id);
      response = await axios.post(
        `${process.env.DIFY_API_BASE_URL}/datasets/${datasetId}/documents/${existingDoc.id}/update_by_file`,
        formData,
        { headers }
      );
    } else {
      console.log('Creating new document');
      response = await axios.post(
        `${process.env.DIFY_API_BASE_URL}/datasets/${datasetId}/document/create_by_file`,
        formData,
        { headers }
      );
    }
    console.log('API Response:', response.status, JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error in processCreatedObject:', error);
    if (error.response) {
      console.error('API error response:', error.response.status, JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function processRemovedObject(objectKey, existingDoc, datasetId) {
  if (existingDoc) {
    console.log('Deleting document:', existingDoc.id);
    try {
      const response = await axios.delete(
        `${process.env.DIFY_API_BASE_URL}/datasets/${datasetId}/documents/${existingDoc.id}`,
        {
          headers: { 'Authorization': `Bearer ${process.env.DIFY_API_KNOWLEDGE_KEY}` }
        }
      );
      console.log('Delete response:', response.status, response.data);
    } catch (error) {
      console.error(`Error deleting document ${existingDoc.id}:`, error);
      if (error.response) {
        console.error('Error response from Dify API:', JSON.stringify(error.response.data, null, 2));
      }
    }
  } else {
    console.log(`Document for ${objectKey} not found in Dify, no deletion needed`);
  }
}

async function findOrCreateDataset(bucketName) {
  let page = 1;
  while (true) {
    const datasetsResponse = await axios.get(`${process.env.DIFY_API_BASE_URL}/datasets`, {
      headers: { 'Authorization': `Bearer ${process.env.DIFY_API_KNOWLEDGE_KEY}` },
      params: { page, limit: 20 }
    });

    const existingDataset = datasetsResponse.data.data.find(dataset => dataset.name === bucketName);

    if (existingDataset) {
      console.log('Found existing dataset:', existingDataset.id);
      return existingDataset.id;
    }

    if (!datasetsResponse.data.has_more) {
      console.log('Dataset not found, creating new one');
      const createDatasetResponse = await axios.post(
        `${process.env.DIFY_API_BASE_URL}/datasets`,
        { name: bucketName },
        { 
          headers: { 
            'Authorization': `Bearer ${process.env.DIFY_API_KNOWLEDGE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Created new dataset:', createDatasetResponse.data.id);
      return createDatasetResponse.data.id;
    }

    page++;
  }
}

async function getExistingDocuments(datasetId) {
  let existingDocs = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(`${process.env.DIFY_API_BASE_URL}/datasets/${datasetId}/documents`, {
      headers: { 'Authorization': `Bearer ${process.env.DIFY_API_KNOWLEDGE_KEY}` },
      params: { page, limit: 100 }
    });

    existingDocs = existingDocs.concat(response.data.data);
    hasMore = response.data.has_more;
    page++;
  }

  return existingDocs;
}

async function testApiConnectivity() {
  try {
    const response = await axios.get(`${process.env.DIFY_API_BASE_URL}/datasets`, {
      headers: { 'Authorization': `Bearer ${process.env.DIFY_API_KNOWLEDGE_KEY}` },
      params: { page: 1, limit: 1 }
    });
    console.log('API Connectivity Test Successful:', response.status);
    return true;
  } catch (error) {
    console.error('API Connectivity Test Failed:', error);
    return false;
  }
}