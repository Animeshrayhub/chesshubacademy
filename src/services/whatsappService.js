/**
 * WhatsApp Lead Automation Service
 * Generates WhatsApp deep links for contacting leads.
 */

const CHESSHUB_PHONE = '917008665245'; // Default academy phone

export function generateWhatsAppLink(phone, name) {
    const message = `Hello ${name},\n\nThanks for your interest in ChessHub Academy!\n\nYou can book a free demo class here:\nhttps://chesshubacademy.com/#booking\n\nReply to this message if you have any questions.\n\n— ChessHub Academy Team`;
    const encoded = encodeURIComponent(message);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function generateTournamentFollowUp(phone, name, tournamentName) {
    const message = `Hi ${name},\n\nThanks for playing in ${tournamentName}!\n\nWant to improve your chess with professional coaching?\n\nBook a free demo class:\nhttps://chesshubacademy.com/#booking\n\n— ChessHub Academy`;
    const encoded = encodeURIComponent(message);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function generateReferralMessage(phone, name, referralCode) {
    const message = `Hey! I've been learning chess at ChessHub Academy and it's been great.\n\nUse my referral code ${referralCode} to sign up:\nhttps://chesshubacademy.com/ref/${referralCode}\n\nWe both get rewards!`;
    const encoded = encodeURIComponent(message);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function generateOutboundLink(name) {
    const message = `Hello ${name},\n\nThanks for your interest in ChessHub Academy!\n\nYou can book a free demo class here:\nhttps://chesshubacademy.com/#booking\n\nReply to this message if you have any questions.`;
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${CHESSHUB_PHONE}?text=${encoded}`;
}
