import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL!,
  name: process.env.SENDGRID_FROM_NAME || "Waseet",
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  return sgMail.send({
    to,
    from: FROM,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });
}

export async function sendWelcomeEmail(to: string, name: string, agencyName: string) {
  return sendEmail({
    to,
    subject: `Bienvenue sur Waseet, ${name} !`,
    html: `
      <h1>Bienvenue sur Waseet, ${name} !</h1>
      <p>Votre agence <strong>${agencyName}</strong> est prête.</p>
      <p>Connectez-vous pour commencer à gérer vos biens et clients.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
         style="background:#C9973A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
        Accéder à mon espace
      </a>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Réinitialisation de votre mot de passe Waseet",
    html: `
      <h1>Réinitialiser votre mot de passe</h1>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}"
         style="background:#C9973A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
        Réinitialiser mon mot de passe
      </a>
      <p style="color:#999;font-size:12px;margin-top:16px">Ce lien expire dans 1 heure.</p>
    `,
  });
}
