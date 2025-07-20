const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.createUser = async (req, res) => {
  const { username, registerno, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      'SELECT * FROM auth.users WHERE registerno = $1',
      [registerno]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userid = uuidv4();

    const newUser = await pool.query(
      'INSERT INTO auth.users (userid, username, registerno, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userid, username, registerno, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { registerno, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM auth.users WHERE registerno = $1',
      [registerno]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: user.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.updateUser = async (req, res) => {
  const { userid } = req.params;
  const updateData = req.body;
  
  try {
    const updatedUser = await pool.query(
      `UPDATE auth.users SET 
       username = $1, email = $2, imageurl = $3, section = $4, 
       currentdegree = $5, yearofstudy = $6, dob = $7, department = $8, 
       remarks = $9, interests = $10, incollege = $11, backlog = $12
       WHERE userid = $13 RETURNING *`,
      [
        updateData.username, updateData.email, updateData.imageurl, 
        updateData.section, updateData.currentdegree, updateData.yearofstudy,
        updateData.dob, updateData.department, updateData.remarks,
        updateData.interests, updateData.incollege, updateData.backlog, userid
      ]
    );
    
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};