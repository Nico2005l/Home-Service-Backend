const db = require('../db/database');

exports.create = (req, res) => {
  const { user_id, service_id, date } = req.body;
  db.run(
    `INSERT INTO bookings (user_id, service_id, date) VALUES (?, ?, ?)`,
    [user_id, service_id, date],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
};

exports.getByUser = (req, res) => {
  const userId = req.params.userId;
  db.all(`SELECT * FROM bookings WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};