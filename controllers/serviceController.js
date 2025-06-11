const db = require('../db/database');

exports.getAll = (req, res) => {
  // Fetch all services with their images
  const sql = `
    SELECT s.*, 
           COALESCE(
             json_group_array(
               CASE WHEN si.id IS NOT NULL THEN si.image_url END
             ), 
             '[]'
           ) AS images
    FROM services s
    LEFT JOIN service_images si ON s.id = si.service_id
    GROUP BY s.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse images JSON array for each row
    const services = rows.map(row => ({
      ...row,
      images: JSON.parse(row.images)
    }));
    res.json(services);
  });
};

exports.create = (req, res) => {
  const { name, description, category, price, images } = req.body;
  db.run(
    `INSERT INTO services (name, description, category, price) VALUES (?, ?, ?, ?)`,
    [name, description, category, price],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      const serviceId = this.lastID;

      // Insert images if provided
      if (Array.isArray(images) && images.length > 0) {
        const placeholders = images.map(() => '(?, ?)').join(', ');
        const values = images.flatMap(image_url => [serviceId, image_url]);
        db.run(
          `INSERT INTO service_images (service_id, image_url) VALUES ${placeholders}`,
          values,
          function (imgErr) {
            if (imgErr) return res.status(400).json({ error: imgErr.message });
            res.status(201).json({ id: serviceId });
          }
        );
      } else {
        res.status(201).json({ id: serviceId });
      }
    }
  );
};

exports.edit = (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, images } = req.body;

  db.run(
    `UPDATE services SET name = ?, description = ?, category = ?, price = ? WHERE id = ?`,
    [name, description, category, price, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      // Update images if provided
      if (Array.isArray(images)) {
        // Remove existing images
        db.run(
          `DELETE FROM service_images WHERE service_id = ?`,
          [id],
          function (delErr) {
            if (delErr) return res.status(400).json({ error: delErr.message });
            // Insert new images
            if (images.length > 0) {
              const placeholders = images.map(() => '(?, ?)').join(', ');
              const values = images.flatMap(image_url => [id, image_url]);
              db.run(
                `INSERT INTO service_images (service_id, image_url) VALUES ${placeholders}`,
                values,
                function (imgErr) {
                  if (imgErr) return res.status(400).json({ error: imgErr.message });
                  res.json({ message: 'Service updated' });
                }
              );
            } else {
              res.json({ message: 'Service updated' });
            }
          }
        );
      } else {
        res.json({ message: 'Service updated' });
      }
    }
  );
};

exports.delete = (req, res) => {
  const { id } = req.params;
  // First, delete images
  db.run(
    `DELETE FROM service_images WHERE service_id = ?`,
    [id],
    function (imgErr) {
      if (imgErr) return res.status(400).json({ error: imgErr.message });
      // Then, delete the service
      db.run(
        `DELETE FROM services WHERE id = ?`,
        [id],
        function (err) {
          if (err) return res.status(400).json({ error: err.message });
          res.json({ message: 'Service deleted' });
        }
      );
    }
  );
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { name, description, category, price } = req.body;
  db.run(
    `UPDATE services SET name = ?, description = ?, category = ?, price = ? WHERE id = ?`,
    [name, description, category, price, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
};
