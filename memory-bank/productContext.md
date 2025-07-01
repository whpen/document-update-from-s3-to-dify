# Product Context: S3 to Dify Knowledge Sync Lambda Function

## Why This Project Exists
This project exists to automate the process of synchronizing files between an AWS S3 bucket and a Dify Knowledge repository. Without this automation, users would need to manually upload files to both S3 for storage and separately to Dify for knowledge processing, which would be time-consuming and error-prone.

## Problems It Solves
1. **Manual Synchronization**: Eliminates the need for manual file uploads to Dify after adding files to S3
2. **Consistency Management**: Ensures that the S3 bucket and Dify Knowledge repository remain in sync
3. **Workflow Automation**: Streamlines the process of updating knowledge bases when source files change
4. **Special Character Handling**: Resolves issues with filenames containing special characters like "/" in folder paths
5. **Deletion Tracking**: Automatically removes documents from Dify when they are deleted from S3

## How It Should Work
1. **Event-Driven Architecture**: The Lambda function is triggered by S3 bucket events (file uploads and deletions)
2. **Automatic Processing**:
   - When a file is uploaded to S3, the function downloads it and uploads it to Dify
   - When a file is deleted from S3, the function deletes the corresponding document from Dify
3. **Dataset Management**: The function automatically creates a dataset in Dify if it doesn't exist
4. **Document Handling**:
   - For new files, creates new documents in Dify
   - For existing files, updates the documents in Dify
   - For deleted files, removes the documents from Dify
5. **Filename Sanitization**: Converts filenames with special characters (like "/" in folder paths) to a format acceptable by Dify

## User Experience Goals
1. **Zero Manual Intervention**: Users should only need to interact with S3; the synchronization to Dify happens automatically
2. **Reliability**: All files in S3 should be accurately represented in Dify
3. **Transparency**: Detailed logging to help troubleshoot any synchronization issues
4. **Scalability**: Handle large numbers of files and frequent updates efficiently
5. **Error Resilience**: Gracefully handle and report errors without breaking the synchronization process
