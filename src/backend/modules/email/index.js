const aws = require("aws-sdk");

exports.sendEmailViaAWS_SES = async function ({ emailBody, emailSubject, emailTo, emailFrom, forceSend = false }) {
	console.log("\n--- AWS SES Service ---\n");
	if (process.env.NODE_ENV === "development" && !forceSend) {
		console.log("Skipping email send in development environment. Use forceSend: true to override.\n");
		return { MessageId: "dev-mode-no-email-sent" };
	}

	const ses = new aws.SES({
		accessKeyId: process.env.SES_AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.SES_AWS_SECRET_ACCESS_KEY,
		region: "us-east-1",
	});

	const params = {
		Destination: {
			ToAddresses: [emailTo],
		},
		Message: {
			Body: {
				Html: {
					Charset: "UTF-8",
					Data: emailBody,
				},
			},
			Subject: {
				Charset: "UTF-8",
				Data: emailSubject,
			},
		},
		Source: emailFrom || process.env.SES_SENDER_EMAIL,
	};

	try {
		const sendEmail = await ses.sendEmail(params).promise();
		console.log("Email send attempted via ses::", sendEmail);
		return sendEmail;
	} catch (error) {
		console.log("SES error::", error);
	}
};
