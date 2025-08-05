/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validatePhoneNumber = (phone) => {
    if (!phone || !phone.trim()) {
        return 'Phone number is required';
    }
    
    // Vietnamese phone number format: starts with 0 or +84, followed by 9 digits
    const phoneRegex = /^(\+84|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone.trim())) {
        return 'Phone number must start with 0 or +84 and have exactly 10 digits total';
    }
    
    return null;
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('84')) {
        return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    return phone;
};

/**
 * Clean phone number input (remove non-digits except +)
 * @param {string} phone - Phone number to clean
 * @returns {string} - Cleaned phone number
 */
export const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
}; 