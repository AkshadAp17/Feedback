# Feedback Tracker App (React Version)

A full-stack web application for collecting and managing feedback with an integrated LLM question-answering feature.

## Features

- Submit feedback with name, message, and rating
- View all submitted feedback
- Ask questions to an LLM (using Hugging Face's free inference API)
- Responsive design with Tailwind CSS

## Technologies Used

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- LLM: Hugging Face Inference API (flan-t5-small model)

## Setup

1. Clone the repository
2. Install dependencies for both client and server:
   ```bash
   cd server && npm install
   cd ../client && npm install