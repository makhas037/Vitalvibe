# API Documentation

Detailed documentation for backend and frontend APIs.


Health news Api key : 54e12cc88596467382c5899c47fa210a
Food and Nutrition Api Key : Na4tu8mFzgV5fDDqArg589axn7NvvtsyFn1V1lWZ
Gemini Api Key : AIzaSyAm1RCik85culAjeW8JDhrUFR677iQuy5s
rapid api key : 42dc11117cmshe181b5b796805fep1486f3jsnf31e947bd8be
openrouter glm 4.5 api key : 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



curl -X POST -H "Content-Type: application/json" -H "X-goog-api-key: AIzaSyAm1RCik85culAjeW8JDhrUFR677iQuy5s" "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent" -d "{\"contents\":[{\"parts\":[{\"text\": \"Hello, world!\"}]}]}"


curl.exe -X POST -H "Content-Type: application/json" -H "X-goog-api-key: AIzaSyAm1RCik85culAjeW8JDhrUFR677iQuy5s" "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent" -d '{"contents":[{"parts":[{"text": "Hello, world!"}]}]}'


curl -X POST -H "Content-Type: application/json" -H "X-goog-api-key: AIzaSyAm1RCik85culAjeW8JDhrUFR677iQuy5s" "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent" -d "@payload.json"

curl -X POST -H "Content-Type: application/json" -H "X-goog-api-key: AIzaSyAm1RCik85culAjeW8JDhrUFR677iQuy5s" "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent" -d "@payload.json"