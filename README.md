🏠 AI-Powered Full-Stack Rental Platform
A production-grade Airbnb-inspired web application built using the MEEN stack — MongoDB, Express.js, EJS, and Node.js. Features a fully integrated AI Concierge search system powered by OpenAI, enabling natural language property discovery with intelligent fallback mechanisms.
🔗 Live Demo: airbnbproject-pnwv.onrender.com/listings

🚀 Features
🤖 AI Concierge Search (New)

Natural language search — type "cozy beach cottage" and get relevant listings
Powered by OpenAI API for intelligent ranking and recommendations
Built with a specification-first workflow using GitHub Copilot in CLI
Graceful fallback system — when OpenAI is unavailable, a custom heuristic scoring engine (70% keyword match + 30% price weighting) ensures users always get results
Query parser extracts keywords, removes stopwords, and uses regex word-boundary matching for accurate MongoDB queries

🏠 Listings

Create, edit, and delete listings (only by the creator)
Upload images using Multer, stored securely on Cloudinary with image cropping
Interactive Mapbox integration to display listing locations
Responsive design

💰 Pricing

GST toggle that dynamically shows price with or without 18% GST

💬 Reviews

Add, edit, delete reviews with 1–5 star ratings using Starability
Average rating display per listing

🔐 Authentication

Secure Sign Up / Login / Logout via Passport.js
Role-based access — only creators can edit or delete their content

🔎 Search

Search listings by country or keyword


🧰 Tech Stack
LayerTechnologyFrontendEJS, HTML, CSS, BootstrapBackendNode.js, Express.jsDatabaseMongoDB AtlasAIOpenAI APIAuthPassport.jsImage HostingMulter + CloudinaryMapsMapbox APIDeploymentRender

🤖 AI Concierge — How It Works
User types: "cozy mountain cottage"
        ↓
1. Query parser extracts keywords → ["cozy", "mountain", "cottage"]
2. Stopwords removed, word variants generated (singular/plural)
3. MongoDB regex search across title, description, location
4. Candidates sent to OpenAI for intelligent ranking
5. If OpenAI unavailable → heuristic fallback scores by
   keyword match fraction (70%) + price weighting (30%)
6. Top results returned to user
Built entirely via GitHub Copilot in CLI following a specification-first development workflow — spec defined upfront, code generated, reviewed line by line, tested, and iterated.

💡 What I Learned
Beyond standard full-stack development, this project taught me how to integrate AI into a real production workflow — writing specifications before code, using CLI-based AI tools to generate and review code, building graceful fallback systems, and thinking about what happens when third-party APIs fail.

⭐ If you found this useful, star the repo!
