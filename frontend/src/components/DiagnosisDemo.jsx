import { useEffect, useState } from "react";
import { fetchSymptoms, fetchDiagnosis } from "../services/symptomService";

function DiagnosisDemo() {
  const [symptoms, setSymptoms] = useState([]);
  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    async function loadSymptoms() {
      const list = await fetchSymptoms();
      setSymptoms(list);
    }
    loadSymptoms();
  }, []);

  async function handleCheck() {
    if (symptoms.length > 0) {
      const firstSymptomId = symptoms[0].ID;
      const result = await fetchDiagnosis([firstSymptomId], "male", 1995);
      setConditions(result);
    }
  }

  return (
    <div>
      <h2>Available Symptoms</h2>
      <ul>
        {symptoms.map((s) => (
          <li key={s.ID}>{s.Name}</li>
        ))}
      </ul>

      <button onClick={handleCheck}>Check Diagnosis</button>

      <h2>Possible Conditions</h2>
      <ul>
        {conditions.map((c, i) => (
          <li key={i}>{c.Issue?.Name}</li>
        ))}
      </ul>
    </div>
  );
}

export default DiagnosisDemo;
