# HealthWise Assistant

A web application that provides health insights and suggestions based on user-entered symptoms. This project utilizes a symptom form to gather information and communicates with a backend powered by an AI model (like Gemini) to generate potential diagnoses, recommendations, and over-the-counter medication suggestions.

**Visit the live website:** [https://health-assistant-frontend.vercel.app](https://health-assistant-frontend.vercel.app)

## Features

* **Symptom Input:** Users can easily enter their symptoms through a clear and intuitive form.
* **Medical History (Optional):** An optional field allows users to provide relevant medical history for more accurate insights.
* **AI-Powered Analysis:** The application sends symptom data to a backend which uses an AI model to analyze the information.
* **Potential Diagnoses:** The AI provides a list of potential medical conditions along with a confidence level for each.
* **Professional Care Recommendation:** The application advises whether seeking professional medical care is recommended based on the analysis.
* **General Advice:** Users receive general advice related to the potential conditions.
* **OTC Medication Suggestions:** The AI suggests relevant over-the-counter medications, including dosage and precautions (with a disclaimer).
* **Clear and Informative Display:** Health insights and suggestions are presented in a well-structured and easy-to-understand format.
* **Important Disclaimers:** The application emphasizes that the information provided is for informational purposes only and not a substitute for professional medical advice.

## Technologies Used

### Frontend

* **React:** A JavaScript library for building user interfaces.
* **Tailwind CSS:** A utility-first CSS framework for rapid styling.
* **react-hot-toast:** For displaying user-friendly notifications (e.g., "Health insights generated!").
* **lucide-react:** A library of beautiful and consistent icons.
* **shadcn/ui:** A collection of accessible and reusable UI components built using Radix UI and Tailwind CSS.

### Backend (Conceptual - Assumed based on project functionality)

* **Node.js:** A JavaScript runtime environment.
* **Express:** A minimal and flexible Node.js web application framework.
* **cors:** Middleware for enabling Cross-Origin Resource Sharing.
* **body-parser:** Middleware for parsing HTTP request bodies.
* **Google Generative AI (or similar):** An AI model used to analyze symptoms and generate health insights.
* **dotenv:** To load environment variables from a `.env` file.

## Setup (for local development - Backend setup is separate)

This README focuses on the frontend setup. Instructions for setting up the backend would be in a separate README within the backend directory (if this were a multi-repository project).



## Backend Communication

The frontend application communicates with the backend API endpoint `/diagnose` using the HTTP POST method. It sends a JSON payload containing the user's symptoms and optional medical history. The backend processes this data using the AI model and returns a JSON response containing the health insights.

## Project Structure 
Health-Assistant/
├── backend/
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   └── vercel.json
├── client/
│   ├── .gitignore
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       │   └── react.svg
│       ├── components/
│       │   ├── DiagnosisDisplay.jsx
│       │   ├── SymptomForm.jsx
│       │   └── ui/
│       │       ├── accordion.jsx
│       │       ├── alert.jsx
│       │       ├── badge.jsx
│       │       ├── card.jsx
│       │       ├── progress.jsx
│       │       └── separator.jsx
│       └── lib/
│           └── utils.js
├── .gitignore



* **`components/`:** Contains reusable UI components such as the symptom input form (`SymptomForm`) and the display for the diagnosis results (`DiagnosisDisplay`).
* **`App.jsx`:** The main component that manages the application state and renders other components.
* **`ui/`:** Houses the custom UI components built with `shadcn/ui`.


## Deployment

The live website is deployed on Vercel, a platform for hosting web applications. Deployment to Vercel is typically straightforward when connected to a Git repository (like GitHub, GitLab, or Bitbucket). Changes pushed to the main branch are often automatically deployed.

## Important Considerations

* **Not Medical Advice:** This application is intended for informational purposes only and should not be considered a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider for any questions you may have regarding a medical condition.
* **Data Privacy:** User-entered symptoms and medical history should be handled with appropriate privacy considerations. Ensure secure communication between the frontend and backend.
* **AI Accuracy:** The accuracy of the AI-generated insights depends on the model used and the quality of the input data. It's crucial to emphasize the potential for inaccuracies and the importance of professional medical consultation.
