import 'dotenv/config';
import SendGrid from "@sendgrid/mail";
import { logCritical } from './SystemLogs';
import 'dotenv/config';


const SendMail = async ({ fromEmail, email, subject, html }: { fromEmail?:string, email: string | string[], subject: string, html: string }) => {
    try {
        if (!email || !subject || !html) {
            console.log('Missing required email parameters');
            throw new Error('Missing required email parameters');
        }

        SendGrid.setApiKey(process.env.SENDGRID_API_KEY || "");
        const msg = {
            to: Array.isArray(email) ? email : [email],
            from: fromEmail ?? process.env.SENDGRID_FROM_EMAIL ?? "", // Verified sender email
            subject: subject,
            html: html,
        };

        await SendGrid.send(msg);

        return true;
    } catch (error: any) {
        logCritical({ message: 'Email sending failed', source: 'SendMail', error })
        throw new Error(`Email sending failed: ${error.message}`);
    }
}

export default SendMail;