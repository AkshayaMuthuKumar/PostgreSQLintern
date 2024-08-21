const Student = require('../models/student');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const cron = require('node-cron');

// Configure the transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akshaya1907@gmail.com',
    pass: 'azkh wnvy afej yntg'  
  }
});

// Function to send the initial notification
const sendInitialNotification = async (student) => {
 const pixelUrl = `http://localhost:3000/api/track-email?email=${student.email}&id=${student.id}`;
  const mailOptions = {
    from: 'akshaya1907@gmail.com',
    to: student.email,
    subject: 'Record Created',
    html: `
      <p>Hello ${student.firstName},</p>
      <p>Your record has been successfully created.</p>
 <img src="${pixelUrl}" alt="" width="1" height="1" style="display: none;">

    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Initial email sent:', student.email);

    await student.update({ initialNotificationSentAt: new Date() });

  } catch (error) {
    console.error('Error sending initial email:', error);
  }
};


// Function to send follow-up notification
const sendFollowUpNotification = async (student) => {
  const mailOptions = {
    from: 'akshaya1907@gmail.com',
    to: student.email,
    subject: 'Reminder: Action Required',
    text: 'We noticed that you have not responded to our previous email. Please review and respond at your earliest convenience.',
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Follow-up email sent:', student.email);
  } catch (error) {
    console.error('Error sending follow-up email:', error);
  }
};

// Cron job to send initial notification
cron.schedule('* * * * *', async () => {
  const oneMinuteAgo = new Date(new Date().getTime() - 60 * 1000);

  try {
    const students = await Student.findAll({
      where: {
        createdAt: {
          [Op.gt]: oneMinuteAgo,
        },
        emailOpened: false, 
      },
    });

    students.forEach(student => {
      sendInitialNotification(student);
    });
  } catch (error) {
    console.error('Error fetching students for initial notification:', error);
  }
});

// Cron job to send follow-up notification
cron.schedule('* * * * *', async () => {
  const oneHourAgo = new Date(new Date().getTime() - 10 * 60 * 1000);

  try {
    const students = await Student.findAll({
      where: {
        initialNotificationSentAt: {
          [Op.lte]: oneHourAgo,
        },
        emailOpened: false,
        followUpSent: false,
      },
    });

    for (const student of students) {
      await sendFollowUpNotification(student);
      await student.update({ followUpSent: true }); 
    }
  } catch (error) {
    console.error('Error fetching students for follow-up notification:', error);
  }
});

module.exports = {
  transporter,
  sendInitialNotification,
  sendFollowUpNotification,
};