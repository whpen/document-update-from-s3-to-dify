# S3 to Dify Knowledge Sync Lambda Function

This tool is an AWS Lambda function designed to synchronize files from a specific AWS S3 bucket to the Dify Knowledge repository.

## Prerequisites

Before you begin, ensure you have the following:

- The shared AWS S3 bucket is created
- IAM user for the shared AWS S3 bucket is created

## Instructions

### 1. Install Dependencies

Navigate to the project directory and run the following command to install the necessary dependencies:

```bash
npm install
```

### 2. Create Deployment Package

Create a ZIP file containing your `lambda_function.js` and the `node_modules` folder. This ZIP file will be used to deploy the Lambda function.
Use the command " zip -r function.zip . " 

### 3. Create AWS Lambda Function

Create an AWS Lambda function with the following key configurations:

- **Runtime:** Node.js 18.x
- **VPC:** Same as your Dify backend

### 4. Upload Deployment Package

Upload the ZIP file created in step 2 to your AWS Lambda function.

### 5. Configure Lambda Function

Ensure the following configurations are set for your Lambda function:

- **Handler:** `lambda_function.handler`
- **Execution Role:** Ensure your Lambda function has the necessary permissions to process the S3 bucket. In the execution role, add the relevant policy to allow S3 access.
- **Timeout:** Choose the "Configuration" tab,Click on "General configuration"and Click "Edit" and adjust the "Timeout" value from 3s to a higher number (e.g. 30s)

### 6. Set Environment Variables

Set the required environment variables in the AWS Lambda function. Refer to `env.example` and the Dify documentation for the necessary environment variables.

## Example `env.example`

```plaintext
S3_BUCKET_NAME=your-s3-bucket-name
DIFY_API_KEY=your-dify-api-key
DIFY_ENDPOINT=your-dify-endpoint
```

Ensure these variables are correctly set in your Lambda function's configuration.

### 7. Create S3 Event Notification

Create a Event notification for the shared S3 bucket, set 'Put' and 'Permanently deleted' as the event types,and set the lambda function as the destination.

## Additional Notes

- Regularly check and update the dependencies to keep the Lambda function secure.
- Monitor the Lambda function logs through AWS CloudWatch for any errors or issues.
- Adjust the Lambda function settings based on your performance requirements and AWS Lambda best practices.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

By following these instructions, you should be able to set up and deploy the Lambda function to synchronize files from your S3 bucket to the Dify Knowledge repository effectively. If you encounter any issues, refer to the AWS Lambda and Dify documentation for further assistance.