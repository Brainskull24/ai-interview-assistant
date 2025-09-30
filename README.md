# AI Interview Assistant

A web application that allows candidates to upload their resumes (PDF/DOCX) and automatically extracts contact information, generates AI-based insights, and prepares interview questions.  

The project consists of a **Next.js frontend** and a **Node.js (Express) backend** for file processing.  

---

## Features

- Upload resumes in PDF or DOCX format.
- Automatic extraction of candidate information (name, email, phone).
- AI-generated analysis of resume content.
- Fallback parsing mechanism if AI misses any details.
- Automatic question generation based on resume content.
- Lightweight frontend-only AI calls; backend only handles file parsing.
- Supports deployment on Vercel (frontend) and Railway/Heroku (backend).

---

## Tech Stack

- **Frontend:** Next.js 13 (App Router), React, Redux Toolkit, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Libraries:** `pdf-parse`, `mammoth`, `formidable`, `lucide-react`, `radix-ui` components  
- **AI Services:** OpenAI / Google GenAI (replaceable with any AI provider)  

---

## Project Structure

```
ai-interview-assistant/
├─ backend/
│ ├─ server.js
│ ├─ package.json
│ └─ ...
├─ src/
│ ├─ app/
│ │ ├─ api/
│ │ ├─ components/
│ │ ├─ lib/
│ │ └─ services/
├─ package.json
└─ README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ai-interview-assistant.git
cd ai-interview-assistant
```


### 2. Backend Setup (Node.js + Express)
Navigate to the backend folder:

```
cd backend
```

Install dependencies:
```
npm install
```

Create a .env file (optional, for environment variables):
```
PORT=5001
```

Start the backend server:

```
node server.js
Backend runs at http://localhost:5001.
```

Endpoint for parsing resumes: POST /parse-resume

Returns JSON:

```
{
  "rawText": "Extracted text from resume"
}
```

### 3. Frontend Setup (Next.js)
Go to the root folder:

```
cd ..
```

Install dependencies:

```
npm install
```

Create a .env.local file with your backend URL:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

Start the frontend in development mode:

```
npm run dev
Visit http://localhost:3000 in your browser.
```

### 4. Usage
- Open the frontend app.
- Click Upload Resume and select a PDF or DOCX file.
- Wait for processing (status indicator shows progress).
- AI analysis and fallback parsing will run automatically.

Generated interview questions are displayed and ready to use.

### 5. Deployment

Frontend (Vercel)
- Push your Next.js project to GitHub.
-  Connect the repository to Vercel.
- Set NEXT_PUBLIC_BACKEND_URL in Vercel environment variables to your backend URL (e.g., Railway URL).
-  Deploy. Frontend will call backend for raw text extraction.

Backend (Railway / Heroku)
- Push backend folder to GitHub.
- Connect repository to Railway or Heroku.
- Set PORT environment variable (e.g., 5000 or 5001).
- Deploy. Railway/Heroku will provide a public URL.
- Use this URL in NEXT_PUBLIC_BACKEND_URL for frontend.
