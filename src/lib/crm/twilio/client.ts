import twilio from "twilio";

export function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
  }

  return twilio(sid, token);
}

export function getTwilioNumber(): string {
  const num = process.env.TWILIO_PHONE_NUMBER;
  if (!num) throw new Error("Missing TWILIO_PHONE_NUMBER");
  return num;
}
