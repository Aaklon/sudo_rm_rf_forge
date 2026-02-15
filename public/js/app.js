// Global variables
let html5QrCode;
let currentUser = null;

// Initialize QR Code Scanner
function initQRScanner() {
  html5QrCode = new Html5Qrcode("reader");

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
  };

  html5QrCode
    .start({ facingMode: "environment" }, config, onScanSuccess, onScanError)
    .catch((err) => {
      console.error("Unable to start QR scanner:", err);
      document.getElementById("scan-result").innerHTML =
        `<p style="color: red;">Camera access denied or not available</p>`;
    });
}

// QR Code scan success callback
function onScanSuccess(decodedText, decodedResult) {
  console.log(`QR Code detected: ${decodedText}`);

  document.getElementById("scan-result").innerHTML = `
        <h3 style="color: #28a745;">✓ Scan Successful!</h3>
        <p><strong>Data:</strong> ${decodedText}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `;

  // Send to backend for verification
  verifyQRCode(decodedText);
}

// QR Code scan error callback
function onScanError(errorMessage) {
  // Ignore continuous scanning errors
}

// Verify QR code with backend
async function verifyQRCode(scannedData) {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch("/api/qr/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ scannedData }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("QR Code verified:", data);
    }
  } catch (error) {
    console.error("Verification error:", error);
  }
}

// Show login form
function showLogin() {
  // Implement login modal/form
  alert("Login form - Implement your login UI here");
}

// Show register form
function showRegister() {
  // Implement register modal/form
  alert("Register form - Implement your register UI here");
}

// Logout function
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  currentUser = null;

  document.getElementById("auth-section").style.display = "block";
  document.getElementById("qr-section").style.display = "none";
  document.getElementById("user-info").style.display = "none";

  if (html5QrCode) {
    html5QrCode.stop();
  }
}

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");

  if (token && userData) {
    currentUser = JSON.parse(userData);
    showAuthenticatedUI();
  }
}

// Show authenticated UI
function showAuthenticatedUI() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("qr-section").style.display = "block";
  document.getElementById("user-info").style.display = "block";

  document.getElementById("profile-data").innerHTML = `
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Display Name:</strong> ${currentUser.displayName || "N/A"}</p>
        <p><strong>UID:</strong> ${currentUser.uid}</p>
    `;

  initQRScanner();
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});
