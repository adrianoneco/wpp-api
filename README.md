# WPP API

WhatsApp API built with [WPPConnect](https://github.com/wppconnect-team/wppconnect), [Fastify](https://www.fastify.io/), [MongoDB](https://www.mongodb.com/), and [MinIO S3](https://min.io/).

## Features

- 🚀 Fast and lightweight REST API with Fastify
- 📱 WhatsApp integration via WPPConnect
- 🗄️ Message storage with MongoDB
- 📁 Media storage with MinIO S3
- 🐳 Docker support with docker-compose
- 🔄 Multi-session support
- 🔧 Fixed instance mode with INSTANCE_NAME

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/adrianoneco/wpp-api.git
cd wpp-api
```

2. Start all services:
```bash
docker-compose up -d
```

3. The API will be available at `http://localhost:3000`

### Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Start MongoDB and MinIO (or use external services)

5. Run the application:
```bash
npm start
```

### Fixed Instance Mode

You can start the application with a fixed WhatsApp instance by setting the `INSTANCE_NAME` environment variable:

```bash
# Using environment variable
INSTANCE_NAME=suporte npm run start

# Or in .env file
INSTANCE_NAME=suporte
```

This will automatically create and connect a WPPConnect session with the specified name when the application starts.

## API Endpoints

### Health Check

- `GET /health` - Check API health
- `GET /` - Get API information

### Sessions

- `GET /api/sessions` - List all active sessions
- `POST /api/sessions` - Create a new session
  ```json
  { "sessionName": "my-session" }
  ```
- `GET /api/sessions/:sessionName/status` - Get session status
- `GET /api/sessions/:sessionName/qrcode` - Get QR code for authentication
- `DELETE /api/sessions/:sessionName` - Close session

### Messages

- `POST /api/sessions/:sessionName/messages/text` - Send text message
  ```json
  {
    "to": "5511999999999@c.us",
    "message": "Hello World!"
  }
  ```
- `POST /api/sessions/:sessionName/messages/image` - Send image message
  ```json
  {
    "to": "5511999999999@c.us",
    "image": "base64_encoded_image",
    "caption": "Image caption"
  }
  ```
- `POST /api/sessions/:sessionName/messages/file` - Send file message
  ```json
  {
    "to": "5511999999999@c.us",
    "file": "base64_encoded_file",
    "filename": "document.pdf",
    "mimetype": "application/pdf",
    "caption": "File caption"
  }
  ```
- `GET /api/sessions/:sessionName/messages` - Get messages from database
- `GET /api/sessions/:sessionName/chats` - Get all chats
- `GET /api/sessions/:sessionName/contacts` - Get all contacts
- `GET /api/sessions/:sessionName/chats/:chatId/messages` - Get chat messages

### Media

- `POST /api/media/upload` - Upload file (multipart/form-data)
- `POST /api/media/upload/base64` - Upload base64 encoded file
  ```json
  {
    "data": "base64_encoded_data",
    "mimetype": "image/jpeg",
    "filename": "image.jpg"
  }
  ```
- `GET /api/media/:objectName` - Get file URL
- `DELETE /api/media/:objectName` - Delete file
- `GET /api/media` - List all files

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/wpp-api` |
| `MINIO_ENDPOINT` | MinIO server endpoint | `localhost` |
| `MINIO_PORT` | MinIO server port | `9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` |
| `MINIO_BUCKET` | MinIO bucket name | `wpp-media` |
| `MINIO_USE_SSL` | Use SSL for MinIO | `false` |
| `WPP_SESSION_NAME` | Default session name | `wpp-session` |
| `WPP_HEADLESS` | Run browser in headless mode | `true` |
| `INSTANCE_NAME` | Fixed instance name (auto-creates session on startup) | `null` |

## Docker Services

The `docker-compose.yml` includes:

- **app** (wpp-api): The main API application on port 3000
- **mongodb**: MongoDB database on port 27017
- **minio**: MinIO S3 storage on ports 9000 (API) and 9001 (Console)

### MinIO Console

Access the MinIO console at `http://localhost:9001` with:
- Username: `minioadmin`
- Password: `minioadmin`

## License

MIT