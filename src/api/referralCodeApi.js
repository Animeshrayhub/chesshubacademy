// Stub API for referral codes (no backend)
export const validateReferralCode = async (code) => {
    return null; // No referral system active
};

export const getCodeOwner = async (code) => {
    return null;
};

export const incrementReferralCount = async (code) => {
    console.log('Referral count increment not available without backend');
    return null;
};
