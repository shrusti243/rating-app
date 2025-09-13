const db = require("../config/db"); // adjust path to your DB connection
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert into database
    const query = "INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [name, email, address, hashedPassword, role], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error registering user" });
      }
      res.json({ message: "User registered successfully" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    // ✅ send role in response
    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  });
};
