const QRCode = require("qrcode");

/**
 * Generate QR code
 */
const generateQR = async (req, res) => {
  try {
    const { data } = req.body;

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 1,
    });

    res.status(200).json({
      success: true,
      message: "QR code generated successfully",
      qrCode: qrCodeDataURL,
      data: data,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({
      error: "Failed to generate QR code",
      message: error.message,
    });
  }
};

/**
 * Verify scanned QR code
 */
const verifyQR = async (req, res) => {
  try {
    const { scannedData } = req.body;

    // Add your verification logic here
    // For example, check against database, validate format, etc.

    res.status(200).json({
      success: true,
      message: "QR code verified successfully",
      scannedData: scannedData,
      verified: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("QR verification error:", error);
    res.status(500).json({
      error: "Failed to verify QR code",
      message: error.message,
    });
  }
};

/**
 * Get QR code history (example endpoint)
 */
const getQRHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    // This is a placeholder - implement actual database logic
    const history = [];

    res.status(200).json({
      success: true,
      history: history,
    });
  } catch (error) {
    console.error("Get QR history error:", error);
    res.status(500).json({
      error: "Failed to fetch QR history",
    });
  }
};

module.exports = {
  generateQR,
  verifyQR,
  getQRHistory,
};
