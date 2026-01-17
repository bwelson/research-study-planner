# Research Study Planner

An AI-powered academic research assistant that helps researchers discover relevant papers, generate sample literature reviews with full citation and references, and create structured reading plans.

## Project Overview

This full-stack web application integrates Semantic Scholar API and Claude AI to provide intelligent paper recommendations, automated literature review generation, and monthly reading plan creation with progress tracking.

**Author:** Welson Bentum  
**Institution:** Kwame Nkrumah University of Science and Technology 
**Year:** 2026

## Features

- **Semantic Paper Search** - AI-powered relevance ranking using Semantic Scholar API
- **Automated Literature Reviews** - Generate structured literature review drafts with Claude AI
- **Monthly Reading Plans** - Create and track monthly reading schedules
- **User Authentication** - Email, GitHub, and Google OAuth support
- **Progress Tracking** - Monitor reading progress and completion status
- **Citation Export** - APA references in LaTeX and Word formats

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management

### Backend
- **Python Flask** - Backend API server
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication

### APIs & Services
- **Semantic Scholar API** - Academic paper search
- **Anthropic Claude API** - AI-powered text generation
- **OAuth Providers** - GitHub, Google authentication

## 📁 Project Structure
```
research-study-planner/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── page.tsx           # Home page
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask application
│   ├── analysis.py       # Paper analysis logic
│   └── test_semantic.py  # Semantic Scholar tests
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── store/                # Zustand state management
└── types/                # TypeScript type definitions
```

## API Keys Required

- **Anthropic Claude API** 
- **Semantic Scholar API** 
- **GitHub OAuth** 
- **Google OAuth** 

## 📊 Database Schema

Uses Prisma ORM with PostgreSQL. Main models:
- `User` - User accounts and authentication
- `SearchHistory` - Track user searches
- `ReadingPlan` - Monthly reading plans
- `Paper` - Saved academic papers

## 📝 License

This project is part of my academic portfolio. Feel free to explore the code, but please provide attribution if you use any components.

## 👤 Author

**Welson Bentum**  
Teaching & Research Assistant  
BSc Statistics (Graduate), KNUST

- Portfolio: [https://bwelson.netlify.app]
- GitHub: [@bwelson](https://github.com/bwelson)
- LinkedIn: [bentumwelson523](https://www.linkedin.com/in/bentumwelson523/)
- Email: bwelson523@gmail.com

## Acknowledgments

- Semantic Scholar for their excellent academic paper API
- Anthropic for Claude AI capabilities

---

**Note:** This is an active research project. Some features may be under development.