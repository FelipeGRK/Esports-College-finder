const handleSearch = async () => {
  const major = document.getElementById("major").value;
  const region = document.getElementById("region").value;
  const esport = document.getElementById("esport").value;

  try {
    const response = await fetch("http://localhost:3000/api/ai-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ major, region, esport }),
    });

    const data = await response.json();
    document.getElementById("results").innerHTML = `<p><strong>AI Suggestion:</strong> ${data.aiSummary}</p>`;

    let list = "<ul>";
    data.data.forEach(college => {
      list += `<li><a href="${college.website}" target="_blank">${college.colleges} - ${college.location}</a></li>`;
    });
    list += "</ul>";

    document.getElementById("results").innerHTML += list;
  } catch (error) {
    document.getElementById("results").innerHTML = "<p>Something went wrong with the search.</p>";
  }
};
