# Chat Application

This project is a chat application with a React frontend and a Node.js backend.

## Project Structure

-   `frontend/`: Contains the React frontend application.
-   `backend/`: Contains the Node.js Express backend server.
-   `docker-compose.yaml`: Docker compose file to run both frontend and backend.

## Getting Started

There are two ways to run this project: using Docker or running each part manually.

### With Docker

1.  Make sure you have Docker and Docker Compose installed.
2.  Run the following command from the root directory:
    ```sh
    docker-compose up
    ```

### Manually

You will need to run the frontend and backend in separate terminals.

#### Backend

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Start the server:
    ```sh
    npm start
    ```

#### Frontend

1.  Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Start the development server:
    ```sh
    npm run dev
    ```
