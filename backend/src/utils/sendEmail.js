import { Resend } from 'resend'
import RegisterSuccessEmail from '../emails/RegisterSuccessEmail.js'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRegisterSuccessEmail({ to, username }) {
  try {
    const html = RegisterSuccessEmail(username)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Mood Tracker <onboarding@resend.dev>',
      to,
      subject: 'Willkommen beim Mood Tracker',
      html
    })
  } catch (error) {
    console.error('E-Mail konnte nicht gesendet werden:', error)
  }
}