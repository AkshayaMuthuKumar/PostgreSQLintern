const sequelize = require('../config/database'); 
const { Op } = require('sequelize');
const Student = require('../models/student')
const { transporter } = require('../utils.js/notification'); 

const nameRegex = /^[a-zA-Z0-9_]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ageRegex = /^(?:0|[1-9][0-9]?|1[01][0-9]|120|121|122|123)$/;

// Create a new student detail
exports.createStudentDetail = async (req, res) => {
  const { firstName, lastName, email, age, student_metadata } = req.body;

  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    return res.status(400).json({ error: 'Invalid firstName or lastName. Only alphanumeric characters and underscores are allowed.' });
}

if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
}

if (!ageRegex.test(age)) {
    return res.status(400).json({ error: 'Invalid age. Only numbers are allowed.' });
}


  try {
    const [result] = await sequelize.query(`
      INSERT INTO "StudentDetails" ("firstName", "lastName", "email", "age", "student_metadata", "createdAt", "updatedAt")
      VALUES (:firstName, :lastName, :email, :age, :student_metadata, NOW(), NOW())
      RETURNING *;
    `, {
      replacements: { firstName, lastName, email, age, student_metadata: JSON.stringify(student_metadata) },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all student details with optional filtering by subject and minimum mark
exports.getAllStudentDetails = async (req, res) => {
  const { subject, minMark, maxMark } = req.query;

  try {
    let query = `
      SELECT "id", "firstName", "lastName", jsonb_agg(filtered_elem) as "filtered_metadata"
      FROM 
        (
          SELECT 
            "StudentDetails".*,elem as filtered_elem
          FROM 
            "StudentDetails",jsonb_array_elements("student_metadata") elem
          WHERE 1 = 1
    `;

    const conditions = [];
    const replacements = {};

    if (subject) {
      conditions.push(`elem->>'subject' = :subject`);
      replacements.subject = subject;
    }

    if (minMark || maxMark) {
      // Apply filter for all subjects, not just the specific one
      const markConditions = [];

      if (minMark) {
        markConditions.push(`(elem->>'mark')::int >= :minMark`);
        replacements.minMark = parseInt(minMark);
      }
      if (maxMark) {
        markConditions.push(`(elem->>'mark')::int <= :maxMark`);
        replacements.maxMark = parseInt(maxMark);
      }
      conditions.push(`EXISTS (
        SELECT 1 
        FROM jsonb_array_elements("student_metadata") all_elems
        WHERE ${markConditions.join(' AND ')}
      )`);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += `
          ) as filtered_subquery
      GROUP BY "id", "firstName", "lastName", "email", "age"
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student detail by ID
exports.getStudentDetailById = async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT * FROM "StudentDetails" WHERE id = :id;
    `, {
      replacements: { id: req.params.id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: 'Student detail not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a student detail
exports.updateStudentDetail = async (req, res) => {
  const { firstName, lastName, email, age, student_metadata } = req.body;

  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    return res.status(400).json({ error: 'Invalid firstName or lastName. Only alphanumeric characters and underscores are allowed.' });
}

if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
}

if (!ageRegex.test(age)) {
    return res.status(400).json({ error: 'Invalid age. Only numbers are allowed.' });
}


  try {
    const [result] = await sequelize.query(`
      UPDATE "StudentDetails" 
      SET "firstName" = :firstName, 
          "lastName" = :lastName, 
          "email" = :email, 
          "age" = :age, 
          "student_metadata" = :student_metadata, 
          "updatedAt" = NOW()
      WHERE id = :id
      RETURNING *;
    `, {
      replacements: { id: req.params.id, firstName, lastName, email, age, student_metadata: JSON.stringify(student_metadata) },
      type: sequelize.QueryTypes.UPDATE,
    });

    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: 'Student detail not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a student detail
exports.deleteStudentDetail = async (req, res) => {
  try {
    const result = await sequelize.query(`
      DELETE FROM "StudentDetails" WHERE id = :id RETURNING *;
    `, {
      replacements: { id: req.params.id },
      type: sequelize.QueryTypes.DELETE,
    });

    if (result[1] > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Student detail not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student details by time range
exports.getStudentDetailsByTime = async (req, res) => {
  const { startTime, endTime } = req.query;

  try {
    const [results] = await sequelize.query(`
      SELECT * FROM "StudentDetails"
      WHERE "createdAt" BETWEEN :startTime AND :endTime;
    `, {
      replacements: { startTime, endTime },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Track email opens
exports.trackEmailOpen = async (req, res) => {
  const { email, id } = req.query;

  try {
    const student = await Student.findByPk(id);

    if (student && student.email === email) {
      await student.update({ emailOpened: true });
 console.log(`Email opened by ${student.email}`);


      const mailOptions = {
        from: 'akshaya1907@gmail.com',
        to: student.email,
        subject: 'Thank You for Your Response',
        text: 'Thank you for accepting the request.',
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.sendStatus(200, "Mail opened");
  } catch (error) {
    console.error('Error tracking email:', error);
    res.sendStatus(500);
  }
};

