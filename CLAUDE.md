# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup & Installation
```bash
# Install dependencies
npm install

# Create deployment package (zip the lambda function and dependencies)
zip -r function.zip .
```

## High-Level Architecture

This repository contains a Node.js-based AWS Lambda function designed to synchronize files between an AWS S3 bucket and a Dify Knowledge Base. The Lambda function is triggered by S3 events (ObjectCreated and ObjectRemoved) and performs the following key operations:

1. **Authentication with Dify API**: Uses an API key stored in environment variables.

2. **Knowledge Base Management**: 
   - Checks if a Dify Knowledge Base dataset exists for the S3 bucket
   - Creates a dataset if one doesn't exist

3. **Document Synchronization**:
   - When objects are created in S3: 
     - Downloads the file content from S3
     - Sanitizes filenames (replacing "/" with "_")
     - Uploads the file to the Dify Knowledge Base
     - Updates existing documents or creates new ones as needed
   
   - When objects are removed from S3:
     - Identifies the corresponding document in Dify
     - Deletes it from the Knowledge Base

4. **Error Handling**:
   - Comprehensive error logging
   - API connectivity testing

## Key Files

- **lambda_function.js**: Main code for the Lambda function
- **package.json**: Project dependencies (aws-sdk, axios)
- **env.example**: Example of required environment variables

## Environment Variables

The Lambda function relies on the following environment variables:

- **AWS_S3_BUCKET**: Name of the S3 bucket to monitor
- **DIFY_API_BASE_URL**: Base URL for the Dify API
- **DIFY_API_KNOWLEDGE_KEY**: API key for authentication with Dify

## Development Notes

- The Lambda function should be deployed with Node.js 18.x runtime
- Configure appropriate timeout settings (recommended: 30+ seconds)
- Set up S3 event notifications to trigger the Lambda function
- The function requires permissions to read from the specified S3 bucket
- git remote is "aws-china"