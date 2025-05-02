import React, { useState } from "react";
import SymptomForm from "./components/SymptomForm";
import { Toaster } from "react-hot-toast";
import { Stethoscope, BrainCircuit } from "lucide-react";
import DiagnosisDisplay from "./components/DiagnosisDisplay";

function App() {
  const [diagnosis, setDiagnosis] = useState("");
  console.log(diagnosis);
  console.log(diagnosis?.name); // Use optional chaining here

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white p-4">
      <Toaster position="top-right" />
      <main className="max-w-2xl mx-auto space-y-8 mt-8">
        {" "}
        {/* Added mt-8 */}
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-cyan-700 text-3xl font-bold">
              <Stethoscope className="h-6 w-6" />
              HealthWise Assistant
              <BrainCircuit className="h-6 w-6" />
            </div>
            <p className="mt-2 text-gray-600 text-sm">
              Enter your symptoms to receive health insights and suggestions.
            </p>
          </div>
          <SymptomForm onDiagnosis={setDiagnosis} />
        </div>
        {/* Diagnosis Section */}
        {diagnosis && <DiagnosisDisplay diagnosis={diagnosis} />}
      </main>
    </div>
  );
}

export default App;
