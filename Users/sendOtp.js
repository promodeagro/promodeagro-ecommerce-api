require("dotenv").config();
const axios = require("axios");
const { randomInt } = require("node:crypto");

const sms_auth = 'elXywroIYOf0MrQHA3as';
const sms_auth_token = 'SrptLYo7GdknJeQ1bFjJl4JHSGnhactnaDESDc4H';
// SMS_AUTH=
// SMS_AUTH_TOKEN=

async function sendOtp(otp, number) {
	const url =
		"https://restapi.smscountry.com/v0.1/Accounts/" + sms_auth + "/SMSes/";
	const header = Buffer.from(

		`${sms_auth}:${sms_auth_token}`,
		"utf-8"
	).toString("base64");
	try {
		const res = await axios.post(
			url,
			{
				Text: `${otp} is your OTP to login to Promode Agro Application. Team Promode Agro Farms.`,
				Number: number,
				SenderId: "PROMAG",
				Tool: "API",
			},
			{
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: "Basic " + header,
				},
			}
		);
		console.log(res);
	} catch (error) {
		throw error;
	}
}

function generateOtp() {
	return randomInt(100000, 999999);
}


// sendOtp(896285,8317582549)
module.exports = { sendOtp, generateOtp };
