const API_KEY = "INSERT_API_KEY_HERE";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  

  const file = document.querySelector("#file").files[0];
  const description = document.querySelector("#text").value;

  if (!file || !description) {
    alert("Please provide both a file and a description.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    const fileatbase64 = reader.result.split(',')[1];

    const requestbody = {
      contents: [
        {
          parts: [
            { text: `Here is a civic issue report. Based on the image and description, identify:
1. issue_type (pothole, garbage, streetlight, water_leak, or other)
2. urgency (low, medium, high)
3. department (which city department should handle this)
4. summary (one sentence)
5.email_draft(body of a mail which user can directly copy and paste to the authorities,just the body not subject of the mail)

Return ONLY valid JSON in this exact format, no markdown, no extra text:
{"issue_type": "...", "urgency": "...", "department": "...", "summary": "..."}

Description: "${description}"` },
            { inline_data: { mime_type: file.type, data: fileatbase64 } }
          ]
        }
      ]
    };
    
    

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestbody)
      });

      const data = await response.json();

      if (data.error) {
        alert("API error: " + data.error.message);
        return;
      }

      const rawText = data.candidates[0].content.parts[0].text;
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleaned);
      console.log(result);

document.querySelector("#result").innerHTML = `
  <div class="result-card">
    <span class="stamp ${result.urgency.toLowerCase()}">${result.urgency} priority</span>
    <div class="field"><b>Issue type</b>${result.issue_type}</div>
    <div class="field"><b>Department</b>${result.department}</div>
    <div class="field"><b>Summary</b>${result.summary}</div>
    <div class="field"><b>Email draft</b>
      <textarea class="email-draft" readonly rows="6">${result.email_draft}</textarea>
    </div>
  </div>
`;

    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };

  reader.readAsDataURL(file);
});