# System Patterns: S3 to Dify Knowledge Sync Lambda Function

## System Architecture
The S3 to Dify Knowledge Sync Lambda function follows a serverless, event-driven architecture:

```
┌─────────────┐     ┌───────────┐     ┌───────────────────┐     ┌───────────────┐
│  S3 Bucket  │────▶│  S3 Event │────▶│  Lambda Function  │────▶│  Dify API     │
└─────────────┘     └───────────┘     └───────────────────┘     └───────────────┘
```

1. **Event Source**: AWS S3 bucket generates events on file uploads and deletions
2. **Processing**: Lambda function processes these events
3. **Integration**: Lambda communicates with Dify API to sync the changes

## Key Technical Decisions

### 1. AWS Lambda as Processing Engine
- **Rationale**: Serverless architecture eliminates the need for managing servers
- **Benefit**: Automatic scaling based on event volume
- **Consideration**: Function timeout limits (configured to 30s instead of default 3s)

### 2. Node.js Runtime
- **Rationale**: Efficient for I/O operations and API calls
- **Benefit**: Rich ecosystem of libraries for AWS SDK and HTTP requests

### 3. Event-Driven Architecture
- **Rationale**: Real-time synchronization when files change
- **Benefit**: Eliminates polling and reduces unnecessary processing

### 4. Filename Sanitization Strategy
- **Approach**: Replace "/" characters with "_" in filenames
- **Rationale**: Preserves hierarchical information while making filenames compatible with Dify API
- **Implementation**: Sanitization function applied before sending to Dify, while preserving original keys for S3 operations

## Design Patterns

### 1. Adapter Pattern
- The Lambda function acts as an adapter between S3 and Dify, translating S3 events into Dify API calls

### 2. Error Handling Pattern
- Comprehensive error logging with specific handling for different error types
- Graceful degradation when errors occur

### 3. Idempotent Operations
- Designed to handle duplicate events safely
- Checks for existing documents before creating new ones

## Component Relationships

### 1. S3 Integration
- Uses AWS SDK to:
  - Download files from S3 when processing creation events
  - Identify deleted files when processing deletion events

### 2. Dify API Integration
- Uses Axios for HTTP requests to:
  - Create/update documents in Dify
  - Delete documents from Dify
  - Query existing documents for comparison

### 3. Dataset Management
- Automatically finds or creates datasets in Dify
- Maintains a mapping between S3 bucket names and Dify datasets

## Critical Implementation Paths

### 1. File Upload Path
```
S3 Upload → Lambda Trigger → Download from S3 → Sanitize Filename → Upload to Dify
```

### 2. File Deletion Path
```
S3 Delete → Lambda Trigger → Sanitize Filename → Find Document in Dify → Delete from Dify
```

### 3. Error Handling Path
```
Error Detection → Error Classification → Detailed Logging → Appropriate Response
```
