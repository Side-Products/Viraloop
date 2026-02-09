import { PRODUCT_NAME, PRODUCT_URL } from "@/config/constants";

export const getInvitationEmailTemplate = ({ inviterName, teamName, inviteLink }) => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation - ${PRODUCT_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #7c3aed;">${PRODUCT_NAME}</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1a1a1a; text-align: center;">
                                You're Invited!
                            </h2>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                                <strong>${inviterName}</strong> has invited you to join their team <strong>"${teamName}"</strong> on ${PRODUCT_NAME}.
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                                ${PRODUCT_NAME} is an AI-powered platform for creating and managing AI influencers. Join the team to collaborate on creating amazing content!
                            </p>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: center;">
                            <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                                Accept Invitation
                            </a>
                        </td>
                    </tr>

                    <!-- Note -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0; padding: 16px; background-color: #f8f5ff; border-radius: 8px; font-size: 14px; line-height: 1.5; color: #6b6b6b; text-align: center;">
                                <strong>Note:</strong> Please sign up or log in with the same email address this invitation was sent to.
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;">
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #9a9a9a;">
                                If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #9a9a9a;">
                                <a href="${PRODUCT_URL}" style="color: #7c3aed; text-decoration: none;">${PRODUCT_NAME}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};
