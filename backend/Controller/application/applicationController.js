const pool = require("../../config/db"); 
const { v4: uuidv4 } = require('uuid');

exports.applyForCompany = async (req, res) => {
  const { register_no, company_id, ineligible_reasons, status } = req.body;

  try {
 
    const existing = await pool.query(
      `SELECT * FROM public.applied WHERE register_no = $1 AND company_id = $2`,
      [register_no, company_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Already applied to this company." });
    }

    const application_id = uuidv4();
    const result = await pool.query(
      `INSERT INTO public.applied (
        application_id, register_no, company_id, ineligible_reasons, status
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [application_id, register_no, company_id, ineligible_reasons || [], status || 'Pending']
    );

    res.status(201).json({ message: "Application submitted", data: result.rows[0] });
  } catch (err) {
    console.error("Error applying:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getApplicationsByRegisterNo = async (req, res) => {
  const { register_no } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM public.applied WHERE register_no = $1`,
      [register_no]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching applications:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getMyApplications = async (req, res) => {
  const { register_no } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT
         a.application_id,
         a.applied_at,
         a.status,
         c.company_name
       FROM public.applied a
       JOIN public.companies c
         ON a.company_id = c.company_id
       WHERE a.register_no = $1
       ORDER BY a.applied_at DESC`,
      [register_no]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getApplicationStatusStats = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM public.applied
      GROUP BY status;
    `);
    res.json(rows); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTopRecruiters = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.company_name,
        COUNT(a.application_id) AS recruited_count
      FROM public.applied a
      JOIN public.companies c
        ON a.company_id = c.company_id
      WHERE a.status = 'Selected'
      GROUP BY c.company_name
      ORDER BY recruited_count DESC
      LIMIT 5;
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.appliedjobs = async (req, res) => {
    const { register_no } = req.params;
    try {
        const { rows } = await pool.query(`
            SELECT a.*, c.company_name
            FROM public.applied a
            JOIN public.companies c ON a.company_id = c.company_id
            WHERE a.register_no = $1 AND (a.status = 'Pending' OR a.status = 'Rejected')
        `, [register_no]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
