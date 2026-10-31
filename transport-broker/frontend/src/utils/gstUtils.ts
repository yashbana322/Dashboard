// Comprehensive Indian Goods and Services Tax (GSTIN) & PAN utilities

export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

export interface GSTValidationResult {
  isValid: boolean;
  stateCode?: string;
  stateName?: string;
  pan?: string;
  error?: string;
}

export function validateGSTIN(rawGstin: string): GSTValidationResult {
  const gstin = (rawGstin || '').trim().toUpperCase();

  if (!gstin) {
    return { isValid: false, error: 'GSTIN is empty' };
  }

  if (gstin.length !== 15) {
    return {
      isValid: false,
      error: `GSTIN must be 15 characters (currently ${gstin.length})`,
    };
  }

  // 15-char regex: 2 digits (state), 5 letters, 4 digits, 1 letter (PAN), 1 char (entity), 1 Z, 1 check digit
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const matchesFormat = gstRegex.test(gstin);

  const stateCode = gstin.substring(0, 2);
  const stateName = GST_STATE_CODES[stateCode] || 'Unknown State Code';
  const pan = gstin.substring(2, 12);

  if (!matchesFormat) {
    return {
      isValid: false,
      stateCode,
      stateName,
      pan,
      error: 'Invalid GSTIN structure. Expected format: 22AAAAA0000A1Z5',
    };
  }

  return {
    isValid: true,
    stateCode,
    stateName,
    pan,
  };
}

export function extractPanFromGst(gstin: string): string {
  const clean = (gstin || '').trim().toUpperCase();
  if (clean.length >= 12) {
    return clean.substring(2, 12);
  }
  return '';
}

export function validatePAN(pan: string): boolean {
  const clean = (pan || '').trim().toUpperCase();
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean);
}
