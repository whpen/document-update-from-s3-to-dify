# Active Context: S3 to Dify Knowledge Sync Lambda Function

## Current Work Focus
The current focus is on improving the robustness of the Lambda function, specifically addressing issues with filenames containing special characters. The most recent work involved implementing a filename sanitization solution to handle folder paths in S3 that contain "/" characters, which were being rejected by the Dify API.

## Recent Changes

### Filename Sanitization Implementation
1. Added a helper function to sanitize filenames by replacing "/" with "_":
   ```javascript
   function sanitizeFilename(filename) {
     return filename.replace(/\//g, "_");
   }
   ```

2. Updated the main handler to use sanitized filenames when looking up existing documents:
   ```javascript
   const sanitizedKey = sanitizeFilename(objectKey);
   console.log('Original key:', objectKey, 'Sanitized key:', sanitizedKey);
   
   // Look for existing document with either the original key or sanitized key
   const existingDoc = existingDocs.find(d => d.name === objectKey || d.name === sanitizedKey);
   ```

3. Modified the `processCreatedObject` function to use sanitized filenames when sending data to Dify:
   ```javascript
   const sanitizedKey = sanitizeFilename(objectKey);
   formData.append('file', new Blob([file.Body]), sanitizedKey);
   const dataJson = JSON.stringify({
     name: sanitizedKey,
     // ...
   });
   ```

4. Updated the `processRemovedObject` function to also use sanitized filenames for consistency:
   ```javascript
   const sanitizedKey = sanitizeFilename(objectKey);
   console.log('Original key for deletion:', objectKey);
   console.log('Sanitized key for deletion:', sanitizedKey);
   ```

## Next Steps

### Short-term Tasks
1. **Testing**: Thoroughly test the filename sanitization solution with various folder structures and special characters
2. **Monitoring**: Set up CloudWatch alarms to monitor for any errors related to filename handling
3. **Documentation**: Update deployment documentation to reflect the changes and explain the filename sanitization approach

### Medium-term Improvements
1. **Enhanced Error Handling**: Implement more robust error handling for edge cases
2. **Retry Mechanism**: Add retry logic for transient API failures
3. **Performance Optimization**: Evaluate and optimize performance for large files or high-volume operations

### Long-term Considerations
1. **Metadata Support**: Extend the function to handle document metadata
2. **Versioning Support**: Add support for versioning of documents
3. **Batch Processing**: Implement batch processing for multiple files

## Active Decisions and Considerations

### Filename Sanitization Strategy
- **Decision**: Replace "/" characters with "_" instead of other alternatives
- **Rationale**: Preserves readability while ensuring compatibility with Dify API
- **Alternatives Considered**:
  - Using URL encoding (e.g., %2F) - Rejected due to reduced readability
  - Extracting just the filename without path - Rejected due to potential naming conflicts
  - Custom encoding scheme - Rejected due to added complexity

### Document Lookup Strategy
- **Decision**: Look for documents with either original or sanitized names
- **Rationale**: Ensures backward compatibility with documents created before the sanitization implementation
- **Consideration**: May need to migrate existing documents to use sanitized names for consistency

### Logging Strategy
- **Decision**: Added detailed logging for both original and sanitized filenames
- **Rationale**: Facilitates debugging and provides clear audit trail
- **Consideration**: May need to implement log level controls for production environments

## Important Patterns and Preferences

### Code Organization
- Keep helper functions at the top level for clarity
- Use async/await for asynchronous operations
- Implement comprehensive error handling and logging

### Naming Conventions
- Use descriptive variable names (e.g., `sanitizedKey` instead of just `key`)
- Use consistent naming patterns across related functions

### Error Handling
- Log detailed error information including response data when available
- Categorize errors appropriately (API errors, S3 errors, etc.)
- Provide meaningful error messages for troubleshooting

## Learnings and Project Insights

### API Constraints
- Dify API has specific filename requirements that reject certain characters
- Need to carefully handle and transform data between systems with different constraints

### Event-Driven Architecture Considerations
- S3 events provide a reliable trigger mechanism but require careful handling
- Need to account for potential duplicate events or out-of-order processing

### Integration Challenges
- Bridging two systems (S3 and Dify) requires careful handling of differences in data formats and requirements
- Importance of thorough testing with real-world scenarios and edge cases
