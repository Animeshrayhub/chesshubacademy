const SHEET_ID = '1Fb6aoYtEJYBmqdBreMC-Y9yBEIfLSpJP3_kGJh3LphU';

// Google Apps Script Web App URL — deploy the script below and paste the URL here
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK;

/**
 * Sends a demo booking to Google Sheets via Apps Script Web App.
 * This is fire-and-forget — it won't block the booking flow if it fails.
 */
export async function appendBookingToSheet(booking) {
    if (!APPS_SCRIPT_URL) {
        console.warn('[GoogleSheets] VITE_GOOGLE_SHEET_WEBHOOK not set. Booking not sent to sheet.');
        console.log('[GoogleSheets] Booking data:', booking);
        return { success: false, reason: 'webhook_not_configured' };
    }

    try {
        const row = {
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            name: booking.name || '',
            email: booking.email || '',
            phone: booking.phone || '',
            preferredDate: booking.preferredDate || '',
            preferredTime: booking.preferredTime || '',
            message: booking.message || '',
            status: 'Pending',
        };

        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Apps Script doesn't support CORS preflight
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row),
        });

        // With no-cors mode, we can't read the response, but the request goes through
        return { success: true };
    } catch (error) {
        console.error('[GoogleSheets] Failed to append booking:', error);
        return { success: false, reason: 'network_error' };
    }
}

/*
 * ═══════════════════════════════════════════════════════════════
 * GOOGLE APPS SCRIPT SETUP (one-time)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Open your Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1Fb6aoYtEJYBmqdBreMC-Y9yBEIfLSpJP3_kGJh3LphU
 *
 * 2. Add these headers in Row 1 of Sheet1:
 *    A1: Timestamp | B1: Name | C1: Email | D1: Phone
 *    E1: Preferred Date | F1: Preferred Time | G1: Message | H1: Status
 *
 * 3. Go to Extensions → Apps Script
 *
 * 4. Replace the default code with:
 *
 *    function doPost(e) {
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
 *      var data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([
 *        data.timestamp,
 *        data.name,
 *        data.email,
 *        data.phone,
 *        data.preferredDate,
 *        data.preferredTime,
 *        data.message,
 *        data.status
 *      ]);
 *      return ContentService
 *        .createTextOutput(JSON.stringify({ status: 'success' }))
 *        .setMimeType(ContentService.MimeType.JSON);
 *    }
 *
 * 5. Click Deploy → New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy and authorize
 *
 * 6. Copy the Web App URL and paste it in your .env:
 *    VITE_GOOGLE_SHEET_WEBHOOK=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
 *
 * 7. Restart the dev server (the .env change requires restart)
 * ═══════════════════════════════════════════════════════════════
 */
