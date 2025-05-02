import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
// import DiagnosisDisplay from "./DiagnosisDisplay";

const SymptomForm = ({ onDiagnosis }) => {
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_BACKENCD_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      toast.error("Please enter your symptoms.");
      return;
    }
    setLoading(true);

    const loadingToast = toast.loading("Generating insights...");
    try {
      const res = await fetch(`${apiUrl}/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, medicalHistory }),
      });

      const data = await res.json();
      console.log(data);

      if (data.result) {
        // You might parse and display this text in <DiagnosisDisplay />
        onDiagnosis(data.result);
        // console.log("Diagnosis:", data.result);
        toast.success("Health insights generated!");
      } else {
        toast.error("No response from AI.");
      }
    } catch (err) {
      toast.error("Error connecting to server." + err);
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 ">
      <div>
        <label className="block font-medium mb-1">Symptoms</label>
        <textarea
          className="w-full  bg-[#f0f0f0] rounded p-2 h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="e.g., fever, headache, fatigue"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Please list all symptoms you are experiencing. Be as specific as
          possible.
        </p>
      </div>

      <div>
        <label className="block font-medium mb-1">
          Medical History (Optional)
        </label>
        <textarea
          className="w-full  rounded bg-[#f0f0f0] p-2 h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="List any relevant medical conditions, allergies, or medications"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Providing relevant medical history can help improve the accuracy of
          the suggestions.
        </p>
      </div>

      <button
        type="submit"
        className="w-full text-base bg-[#a5d4e3]  text-black py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-4"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Get Health Insights
      </button>
    </form>
  );
};
export default SymptomForm;
