document.addEventListener("DOMContentLoaded", async function() {
    const counter = document.getElementById("counter");
    if (!counter) return;

    try {
        const response = await fetch("https://y524tb7z3m6mdu55hia3aky46m0ghubf.lambda-url.us-east-1.on.aws/");
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        counter.innerHTML = data.views;
    } catch (error) {
        console.error("Failed to fetch view count:", error);
        counter.innerHTML = "—";
    }
});
