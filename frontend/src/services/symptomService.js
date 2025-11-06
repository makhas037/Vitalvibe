const API_BASE = "http://localhost:5001/api";

export const fetchDiagnosis = async (symptoms, gender, year_of_birth) => {
    try {
        const response = await fetch(`${API_BASE}/symptoms/diagnose`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symptoms, gender, year_of_birth }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch diagnosis from backend');
        }
        return await response.json();
    } catch (error) {
        console.error("Symptom Service Error:", error);
        return []; // Return empty array on error
    }
};