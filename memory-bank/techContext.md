# Technical Context: S3 to Dify Knowledge Sync Lambda Function

## Technologies Used

### Core Technologies
1. **AWS Lambda**
   - Runtime: Node.js 18.x
   - Execution environment: Serverless
   - Trigger: S3 bucket events

2. **AWS S3**
   - Used for file storage
   - Generates events on file uploads and deletions
   - Requires proper IAM permissions for access

3. **Dify API**
   - Knowledge base management platform
   - RESTful API for document operations
   - Authentication via API keys

### Libraries and Dependencies
1. **aws-sdk (v2.1671.0)**
   - Used for S3 operations
   - Handles authentication with AWS services
   - Downloads files from S3 buckets

2. **axios (v1.7.3)**
   - Used for HTTP requests to Dify API
   - Handles promise-based API calls
   - Manages request/response lifecycle

## Development Setup

### Local Development
1. **Environment Variables**
   - AWS_S3_BUCKET: Name of the S3 bucket to monitor
   - DIFY_API_BASE_URL: Base URL for the Dify API
   - DIFY_API_KNOWLEDGE_KEY: API key for authentication with Dify

2. **Project Structure**
   - lambda_function.js: Main Lambda handler and business logic
   - package.json: Project dependencies and metadata
   - env.example: Example environment variables

### Deployment Process
1. Install dependencies: `npm install`
2. Create deployment package: `zip -r function.zip .`
3. Upload ZIP file to AWS Lambda
4. Configure Lambda function settings:
   - Handler: `lambda_function.handler`
   - Runtime: Node.js 18.x
   - Timeout: 30 seconds (increased from default 3s)
   - VPC: Same as Dify backend
   - Environment variables: Set according to env.example

## Technical Constraints

### AWS Lambda Limitations
1. **Execution Time**: Maximum 15 minutes, but configured to 30 seconds for this function
2. **Memory**: Default 128MB, can be increased if needed
3. **Deployment Package Size**: Maximum 50MB (zipped), 250MB (unzipped)

### Dify API Constraints
1. **Rate Limiting**: May impose limits on API requests
2. **File Size**: May have limitations on maximum file size
3. **Filename Restrictions**: Does not accept filenames with "/" characters

### S3 Considerations
1. **Event Notification Delay**: S3 events may have slight delays
2. **Event Types**: Only configured for 'Put' and 'Permanently deleted' events

## Dependencies

### External Services
1. **AWS S3**: For file storage and event generation
2. **Dify API**: For knowledge base management

### Internal Dependencies
1. **IAM Permissions**: Requires proper permissions to access S3
2. **Network Configuration**: Lambda must be in same VPC as Dify backend
3. **API Keys**: Requires valid Dify API key

## Tool Usage Patterns

### AWS SDK Usage
```javascript
// S3 object retrieval pattern
const file = await s3.getObject({ Bucket: bucketName, Key: objectKey }).promise();
```

### Axios Usage
```javascript
// Dify API request pattern
const response = await axios.post(
  `${process.env.DIFY_API_BASE_URL}/datasets/${datasetId}/document/create_by_file`,
  formData,
  { headers }
);
```

### Filename Sanitization Pattern
```javascript
// Sanitize filenames by replacing '/' with '_'
function sanitizeFilename(filename) {
  return filename.replace(/\//g, "_");
}
```
