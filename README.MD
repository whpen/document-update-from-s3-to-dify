This tool is a lambda function to sync the files from a specific AWS S3 bucket to the Dify Knowledge

Instruction:

Run npm install to install the dependencies
Create a ZIP file containing your lambda_function.js and the node_modules folder
Create the AWS Lambda function with following key configuration:(Runtime: Node.js 18.x, VPC: Same as your Dify backend)
Upload this ZIP file to your AWS Lambda function
Ensure your Lambda function's handler is set to lambda_function.handler
Ensure your Lambda function has permission to process the S3 bucket (in the Execution Role, add the relevant policy)
Set the environment variables in the AWS Lambda function, refer to the env.example and Dify doc