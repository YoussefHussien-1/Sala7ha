const {
  EGYPT_GOVERNORATES,
} = require("../constants/egyptGovernorates");

// Convert Arabic numbers to English numbers
const toEnglishDigits = (value) => {
  const digits = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",

    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };

  return String(value).replace(/[٠-٩۰-۹]/g, (digit) => {
    return digits[digit];
  });
};

// Egyptian Mobile Number Validation
const normalizeEgyptianPhone = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  let phone = toEnglishDigits(value);

  // Remove spaces, dashes and parentheses
  phone = phone.replace(/[\s()-]/g, "");

  // Local Egyptian format
  if (/^01[0125]\d{8}$/.test(phone)) {
    return phone;
  }

  // International format +20
  const international = phone.match(
    /^(?:\+20|0020)(1[0125]\d{8})$/
  );

  if (international) {
    return `0${international[1]}`;
  }

  return null;
};

// Governorate Validation
const normalizeGovernorate = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  const governorate = EGYPT_GOVERNORATES.find(
    (item) =>
      item.value.toLowerCase() === normalizedValue ||
      item.label === value.trim()
  );

  return governorate ? governorate.value : null;
};

module.exports = {
  normalizeEgyptianPhone,
  normalizeGovernorate,
};