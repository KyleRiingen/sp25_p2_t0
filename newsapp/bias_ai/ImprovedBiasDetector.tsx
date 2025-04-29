/*
"use client";
import { useState } from "react";

const SimpleBiasDetector = () => {
   const [inputText, setInputText] = useState("");

   return (
      <div
         style={{
            maxWidth: "600px",
            margin: "20px auto",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "white",
         }}
      >
         <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Political Bias Detector</h2>

         <textarea
            style={{
               width: "100%",
               padding: "10px",
               marginBottom: "15px",
               border: "1px solid #ddd",
               borderRadius: "4px",
               minHeight: "100px",
            }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to analyze..."
         />

         <button
            style={{
               display: "block",
               width: "100%",
               padding: "10px",
               backgroundColor: "#0070f3",
               color: "white",
               border: "none",
               borderRadius: "4px",
               cursor: "pointer",
               fontSize: "16px",
            }}
            onClick={() => alert("Button clicked! Text: " + inputText)}
         >
            Analyze Bias
         </button>
      </div>
   );
};

export default SimpleBiasDetector;
*/
"use client";
import { useState } from "react";

const BiasDetector = () => {
   // Specify the type as number[] | null
   const [inputText, setInputText] = useState("");
   const [biasResult, setBiasResult] = useState<number[] | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");

   const handleSubmit = async () => {
      if (!inputText.trim()) {
         setError("Please enter some text to analyze");
         return;
      }

      setIsLoading(true);
      setError("");

      try {
         const response = await fetch(`http://localhost:8000/predict?text=${encodeURIComponent(inputText)}`, {
            method: "POST",
            headers: { Accept: "application/json" },
         });

         if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
         }

         const data = await response.json();
         setBiasResult(data.bias_scores);
      } catch (err) {
         console.error("Error analyzing text:", err);
         setError("Failed to analyze text. Please try again later.");
      } finally {
         setIsLoading(false);
      }
   };

   // Function to determine the dominant bias
   const getDominantBias = () => {
      if (!biasResult) return null;

      const labels = ["Left", "Center", "Right"];
      const maxIndex = biasResult.indexOf(Math.max(...biasResult));
      return {
         label: labels[maxIndex],
         score: (biasResult[maxIndex] * 100).toFixed(2),
      };
   };

   const dominant = getDominantBias();

   return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md my-8">
         <h2 className="text-2xl font-bold text-center mb-6">Political Bias Detector</h2>

         <div className="mb-4">
            <textarea
               className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               rows={4}
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="Enter an article or statement to analyze for political bias..."
            />
         </div>

         <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300">
            {isLoading ? "Analyzing..." : "Analyze Bias"}
         </button>

         {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

         {biasResult && (
            <div className="mt-6">
               <h3 className="text-xl font-semibold mb-3">Analysis Results</h3>

               <div className="mb-4">
                  <div className="flex justify-between mb-1">
                     <span>Left</span>
                     <span>{(biasResult[0] * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                     <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${biasResult[0] * 100}%` }}></div>
                  </div>
               </div>

               <div className="mb-4">
                  <div className="flex justify-between mb-1">
                     <span>Center</span>
                     <span>{(biasResult[1] * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                     <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${biasResult[1] * 100}%` }}></div>
                  </div>
               </div>

               <div className="mb-4">
                  <div className="flex justify-between mb-1">
                     <span>Right</span>
                     <span>{(biasResult[2] * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                     <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${biasResult[2] * 100}%` }}></div>
                  </div>
               </div>

               {dominant && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-md text-center">
                     <p className="font-medium">
                        Predominant Bias: <span className="font-bold">{dominant.label}</span> ({dominant.score}%)
                     </p>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default BiasDetector;
