import React from 'react';

/**
 * Formats a string or number value into Chilean Peso (CLP) currency format.
 * e.g., 17000 -> $17.000
 * Handles null, undefined, empty strings, and non-numeric values gracefully.
 * @param value The value to format.
 * @returns A formatted currency string or 'N/A'.
 */
export const formatCLP = (value: string | number | undefined): string => {
  if (value === null || value === undefined || String(value).trim() === '' || String(value).trim().toLowerCase() === 'n/a') {
    return 'N/A';
  }

  // Extract numbers from the string to handle inputs like "CLP $17.000"
  const numericString = String(value).replace(/[^0-9]/g, '');
  const number = parseInt(numericString, 10);

  if (isNaN(number)) {
    // If it's not a number after stripping, it might be some other text.
    // Return the original value if it's not just whitespace, otherwise N/A.
    return String(value).trim() || 'N/A';
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};
