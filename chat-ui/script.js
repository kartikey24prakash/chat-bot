const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.querySelector("button");

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Remove welcome screen on first message
  const welcome = document.querySelector(".welcome");
  if (welcome) welcome.remove();

  addMessage(text, "user");
  input.value = "";
  sendBtn.disabled = true;

  // Typing indicator
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.id = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  messagesDiv.appendChild(typing);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const res = await fetch("https://chat-bot-pnga.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    document.getElementById("typing")?.remove();
    addMessage(data.reply || "⚠ No response.", "ai");
  } catch (err) {
    document.getElementById("typing")?.remove();
    addMessage("⚠ Could not reach server.", "ai");
  }

  sendBtn.disabled = false;
  input.focus();
}

function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.classList.add("message", type);
  msg.innerText = text;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});