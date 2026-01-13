# 🤖 Edumatrix-AI - Your Intelligent Document Companion

**Live Demo**: [Link to Your Live Demo Here]

A powerful, AI-driven application that transforms your static PDF documents into interactive, conversational partners. Get instant answers, summaries, and insights just by asking.

![Status](https://img.shields.io/badge/Status-In%20Development-orange) ![Next.js](https://img.shields.io/badge/Next.js-15+-blue) ![Python](https://img.shields.io/badge/Python-3.8+-green) ![AI](https://img.shields.io/badge/AI-Mistral-ff69b4)

## ✨ Features

### 💬 Conversational Q&A
- **Natural Language Processing**: Ask questions in plain English and get human-like answers.
- **Context-Aware Responses**: The AI understands the entire document's context, providing highly accurate and relevant information.
- **Real-time Streaming**: Get instant, character-by-character responses for a fluid and dynamic interaction.

### 📄 Intelligent Document Processing
- **PDF Analysis**: Upload any PDF and have it instantly analyzed and ready for questioning.
- **Retrieval-Augmented Generation (RAG)**: Our advanced RAG pipeline finds the exact snippets of information needed to answer your questions, eliminating hallucinations.
- **Secure Ingestion**: Your documents are processed securely on the backend, ensuring privacy and data integrity.

### 🎨 Modern UI/UX
- **Sleek, Clean Interface**: A minimalist and intuitive chat interface that's easy to navigate.
- **Light & Dark Modes**: Switch between themes for optimal viewing comfort, day or night.
- **Responsive Design**: A seamless experience whether you're on a desktop, tablet, or mobile device.

## 🚀 Live Application

**🌐 Frontend**: [Link to Deployed Frontend]
**⚡ Backend API**: [Link to Deployed Backend API]

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - Modern React framework for full-stack web applications.
- **React 19** - The latest in UI library innovation.
- **TypeScript** - For robust, type-safe code.
- **Tailwind CSS** - A utility-first CSS framework for rapid UI development.

### Backend
- **Python 3.8+** - The leading language for AI and data processing.
- **FastAPI** - High-performance Python web framework for building APIs.
- **Sentence-Transformers** - For creating state-of-the-art text and image embeddings.
- **ChromaDB** - The open-source embedding database for AI applications.

### AI & Deployment
- **Mistral AI** - Powering our conversational AI with cutting-edge large language models.
- **Docker** - Containerization for consistent development and deployment environments.

## 🎯 How to Use

1.  **Visit the live app**: Navigate to the demo link.
2.  **Upload Your PDF**: Click the "Upload PDF" button and select a document from your device.
3.  **Confirmation**: A message will appear confirming your document is loaded and ready.
4.  **Ask Anything**: Type your question into the chatbox and press Enter.
5.  **Get Instant Answers**: Watch as the AI companion streams a detailed, context-aware response based on your document's content.

## 🏗️ Local Development

### Prerequisites
- Node.js 18.0.0+
- Python 3.8.0+
- `npm` & `pip`

### Setup
1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd Edumatrix-AI
    ```

2.  **Install backend dependencies**:
    ```bash
    cd rag-service
    python -m venv .venv
    # On macOS/Linux:
    source .venv/bin/activate
    # On Windows:
    .venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Install frontend dependencies**:
    ```bash
    cd ../nextjs2
    npm install
    ```

4.  **Environment Variables**:
    Create a `.env.local` file inside the `nextjs2` directory:
    ```env
    # nextjs2/.env.local
    MISTRAL_API_KEY=your_mistral_api_key
    ```

### Start Development Servers
```bash
# Terminal 1: Start Backend API
cd rag-service
uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend App
cd nextjs2
npm run dev
```

5.  **Open your browser**: Visit `http://localhost:3000`

## 🔑 API Keys

### Mistral AI
1.  Visit [mistral.ai](https://mistral.ai/).
2.  Sign up and navigate to the API keys section.
3.  Create a new API key and copy it into your `nextjs2/.env.local` file.

## 📱 Screenshots

<img width="1882" height="901" alt="image" src="https://via.placeholder.com/800x400.png?text=App+Screenshot+Here" />

## 🤝 Contributing

This is a personal project, but suggestions and feedback are always welcome! Feel free to:
- Report bugs by opening an issue.
- Suggest new features or improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Your Name/Handle](https://github.com/your-github-link)**

*Transforming documents, one conversation at a time.*