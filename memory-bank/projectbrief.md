# Project Brief: S3 to Dify Knowledge Sync Lambda Function

## Project Overview
This project is an AWS Lambda function designed to synchronize files from an AWS S3 bucket to a Dify Knowledge repository. The function monitors S3 bucket events (file uploads and deletions) and automatically updates the corresponding documents in the Dify Knowledge base.

## Core Requirements
1. Monitor S3 bucket for file changes (uploads and deletions)
2. Synchronize files from S3 to Dify Knowledge repository
3. Handle both file creation and deletion events
4. Manage dataset creation if needed
5. Handle document updates for existing files
6. Properly handle filenames with special characters (specifically "/" in folder paths)

## Technical Stack
- AWS Lambda
- Node.js
- AWS SDK for S3 operations
- Axios for HTTP requests to the Dify API

## Configuration Requirements
- AWS S3 bucket name
- Dify API base URL
- Dify API knowledge key

## Deployment Requirements
- Lambda function deployed in the same VPC as Dify backend
- Proper IAM permissions for S3 access
- Environment variables configured
- S3 event notifications set up for 'Put' and 'Permanently deleted' events

## Recent Updates
- Fixed issue with filenames containing "/" characters by implementing a sanitization function that replaces "/" with "_" before sending to Dify API
