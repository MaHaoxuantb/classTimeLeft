/**
 * Pads a number with a leading zero if it is less than 10.
 * @param {number} num - The number to pad.
 * @returns {string} Padded number as string
 */
export function pad(num) {
return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Parses a time string in the format "HH:MM" and returns a Date object.
 * If the time has already passed today, optionally returns tomorrow's date.
 * @param {string} timeStr - The time string to parse.
 * @param {boolean} isNextDay - Whether to parse for tomorrow's date.
 * @returns {Date|null} The parsed Date or null if timeStr is invalid.
 */
export function parseTime(timeStr, isNextDay = false) {
const timeParts = timeStr.split(':').map(Number);
if (timeParts.length !== 2 || timeParts.some(isNaN)) {
    console.error(`Invalid time format: ${timeStr}`);
    return null;
}
const [hours, minutes] = timeParts;
const now = new Date();
let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
if (isNextDay) {
    date.setDate(date.getDate() + 1);
}
return date;
}