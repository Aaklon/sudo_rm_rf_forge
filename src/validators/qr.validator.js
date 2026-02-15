/**
 * Validate QR code data
 */
const validateQRData = (req, res, next) => {
  const { data } = req.body;

  if (!data || typeof data !== "string" || data.trim().length === 0) {
    return res.status(400).json({
      error: "Validation failed",
      message: "QR code data is required and must be a non-empty string",
    });
  }

  next();
};

/**
 * Validate QR code scan result
 */
const validateQRScan = (req, res, next) => {
  const { scannedData } = req.body;

  if (!scannedData || typeof scannedData !== "string") {
    return res.status(400).json({
      error: "Validation failed",
      message: "Scanned data is required",
    });
  }

  next();
};

module.exports = {
  validateQRData,
  validateQRScan,
};
