const db = require('../db/database');

exports.getAll = (req, res) => {
  db.all(`SELECT * FROM services`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.create = (req, res) => {
  const { name, description, category, price } = req.body;
  db.run(
    `INSERT INTO services (name, description, category, price) VALUES (?, ?, ?, ?)`,
    [name, description, category, price],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
};