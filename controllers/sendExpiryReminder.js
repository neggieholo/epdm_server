const nodemailer = require("nodemailer");
const Logger = require('../models/logger');

const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 587,
  auth: {
    user: "emailapikey",
    pass: process.env.ZOHOEMAILPASS,
  }
});

const { addDays, startOfDay, endOfDay, format } = require("date-fns");

async function sendExpiryReminders(daysBefore) {
    try {
        const now = new Date();
        const targetDate = addDays(now, daysBefore);

        // Start and end of the target day
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        // Find users whose subscriptionExpiry matches this day
        const users = await Logger.find({
            subscriptionExpiry: { $gte: start, $lte: end },
            email: { $exists: true, $ne: null },
        });

        if (users.length === 0) {
            console.log(`No users expiring in ${daysBefore} days.`);
            return;
        }

        for (const user of users) {
            const expiryDate = format(new Date(user.subscriptionExpiry), "PPPpp");

            let subject;
            if (daysBefore === 30) {
                subject = "⏰ Your subscription will expire in one month";
            } else if (daysBefore === 14) {
                subject = "⚠️ Your subscription will expire in 2 weeks";
            } else if (daysBefore === 0) {
                subject = "❌ Your subscription expires today";
            } else {
                return;
            }

            const mailOptions = {
                from: "EnergyProjectsData <info@energyprojectsdata.com>",
                to: user.email,
                subject,
                html: `<p>Hello,</p>
           <p>Your subscription ${daysBefore === 0
                        ? "expires today."
                        : `will expire on <strong>${expiryDate}</strong>.`
                    }</p>
           <p>Please renew your subscription to avoid disruption.</p>
           <p>Thank you,<br>EnergyProjectsData</p>`,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Reminder (${daysBefore} days) sent to ${user.email}`);

            if (daysBefore === 0) {
                const adminOptions = {
                    from: "EnergyProjectsData <info@energyprojectsdata.com>",
                    to: "info@energyprojectsdata.com",
                    subject: `🔔 Subscription expired: ${user.firstName} ${user.lastName}`,
                    html: `<p>The following subscriber's plan expires today:</p>
                           <ul>
                             <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
                             <li><strong>Email:</strong> ${user.email}</li>
                             <li><strong>Expiry Date:</strong> ${expiryDate}</li>
                           </ul>`,
                };

                await transporter.sendMail(adminOptions);
                console.log(`Admin notified about expired user: ${user.email}`);
            }
        }
    } catch (error) {
        console.error("Error sending subscription reminders:", error);
    }
}




module.exports = sendExpiryReminders