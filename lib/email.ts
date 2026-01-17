import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  try {
    console.log('Attempting to send email to:', email);
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Welcome to ResearchNest!',
      html: `
        <h1>Welcome to ResearchNest!</h1>
        <p>Your account has been created successfully.</p>
        <p>You have 1 free search to get started.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Start searching</a></p>
      `
    });
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Email error:', error);
  }
}

  export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    console.log('Sending password reset email to:', email);
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Reset Your Password - ResearchNest',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
    console.log('Password reset email sent:', result);
  } catch (error) {
    console.error('Password reset email error:', error);
  }
}
}