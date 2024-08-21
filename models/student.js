const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path to your database config

const StudentDetails = sequelize.define('StudentDetails', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_metadata: {
        type: DataTypes.JSONB, 
        allowNull: false,
        validate: {
            isValidMetadata(value) {
                if (!Array.isArray(value)) {
                    throw new Error('student_metadata must be an array');
                }
                value.forEach(item => {
                    if (typeof item.subject !== 'string' || typeof item.mark !== 'number') {
                        throw new Error('Each item in student_metadata must have a subject (string) and a mark (number)');
                    }
                });
            }
        }
    },
    emailOpened: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    followUpSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      initialNotificationSentAt: {
        type: DataTypes.DATE, 
      },
}, {
    timestamps: true 
});

module.exports = StudentDetails;
