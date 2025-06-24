const db = require('../db/database');

// GET all services con imágenes
exports.getAll = (req, res) => {
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

    const services = rows.map(row => ({
      ...row,
      images: JSON.parse(row.images)
    }));
    res.json(services);
  });
};

// GET by ID con imágenes
exports.getById = (req, res) => {
  const id = req.params.id;

  const serviceSql = `SELECT * FROM services WHERE id = ?`;
  const imagesSql = `SELECT image_url FROM service_images WHERE service_id = ?`;

  db.get(serviceSql, [id], (err, service) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

    db.all(imagesSql, [id], (imgErr, rows) => {
      if (imgErr) return res.status(500).json({ error: imgErr.message });

      service.images = rows.map(row => row.image_url);
      res.json(service);
    });
  });
};

// GET by USER_ID con imágenes
exports.getByUserId = (req, res) => {
  const id = req.params.id;

  const serviceSql = `SELECT * FROM services WHERE user_id = ?`;
  const imagesSql = `SELECT image_url FROM service_images WHERE service_id = ?`;

  db.get(serviceSql, [id], (err, service) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

    db.all(imagesSql, [id], (imgErr, rows) => {
      if (imgErr) return res.status(500).json({ error: imgErr.message });

      service.images = rows.map(row => row.image_url);
      res.json(service);
    });
  });
};

// CREATE con imágenes
exports.create = (req, res) => {
  const { name, user_id, description, category, price, images } = req.body;
  db.run(
    `INSERT INTO services (name, user_id, description, category, price) VALUES (?, ?, ?, ?, ?)`,
    [name, user_id, description, category, price],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });

      const serviceId = this.lastID;

      if (Array.isArray(images) && images.length > 0) {
        const placeholders = images.map(() => '(?, ?)').join(', ');
        const values = images.flatMap(url => [serviceId, url]);

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

// UPDATE completo (incluye imágenes)
exports.update = (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, images } = req.body;

  db.run(
    `UPDATE services SET name = ?, description = ?, category = ?, price = ? WHERE id = ?`,
    [name, description, category, price, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });

      if (!Array.isArray(images)) {
        return res.json({ message: 'Servicio actualizado' });
      }

      // Primero borramos las imágenes viejas
      db.run(
        `DELETE FROM service_images WHERE service_id = ?`,
        [id],
        function (delErr) {
          if (delErr) return res.status(400).json({ error: delErr.message });

          if (images.length > 0) {
            const placeholders = images.map(() => '(?, ?)').join(', ');
            const values = images.flatMap(url => [id, url]);

            db.run(
              `INSERT INTO service_images (service_id, image_url) VALUES ${placeholders}`,
              values,
              function (imgErr) {
                if (imgErr) return res.status(400).json({ error: imgErr.message });
                res.json({ message: 'Servicio e imágenes actualizados' });
              }
            );
          } else {
            res.json({ message: 'Servicio actualizado (sin imágenes)' });
          }
        }
      );
    }
  );
};

// DELETE (con imágenes)
exports.delete = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM service_images WHERE service_id = ?`, [id], function (imgErr) {
    if (imgErr) return res.status(400).json({ error: imgErr.message });

    db.run(`DELETE FROM services WHERE id = ?`, [id], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Servicio eliminado' });
    });
  });
};
