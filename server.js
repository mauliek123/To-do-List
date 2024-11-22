const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Set up MySQL connection
const db = mysql.createConnection({
  host: "mydb.cvi6gmw8kxmy.eu-north-1.rds.amazonaws.com",
  user: "admin",
  password: "Maulie15k",
  database: "todo_db",
  port: "3306",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// API to get all tasks
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).send("Error fetching tasks");
    } else {
      res.json(results);
    }
  });
});

// API to add a new task with name
app.post("/tasks", (req, res) => {
  const { task, name } = req.body;

  if (!task || !name) {
    res.status(400).send("Task and Name are required");
    return;
  }

  const sql = "INSERT INTO todos (task, name, completed) VALUES (?, ?, false)";
  db.query(sql, [task, name], (err, result) => {
    if (err) {
      console.error("Error adding task:", err);
      res.status(500).send("Error adding task");
    } else {
      res.status(201).send("Task added successfully");
    }
  });
});

// API to delete a task
app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM todos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting task:", err);
      res.status(500).send("Error deleting task");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Task not found");
    } else {
      res.status(204).send("Task deleted successfully");
    }
  });
});

// API to toggle task completion status
app.put("/tasks/toggle/:id", (req, res) => {
  const id = req.params.id;

  // Check the current completion status
  const queryCheck = "SELECT completed FROM todos WHERE id = ?";
  db.query(queryCheck, [id], (err, results) => {
    if (err) {
      console.error("Error fetching task status:", err);
      res.status(500).send("Error fetching task status");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("Task not found");
      return;
    }

    const currentStatus = results[0].completed;
    const newStatus = !currentStatus;

    // Update the task's completion status
    const queryUpdate = "UPDATE todos SET completed = ? WHERE id = ?";
    db.query(queryUpdate, [newStatus, id], (err, result) => {
      if (err) {
        console.error("Error updating task status:", err);
        res.status(500).send("Error updating task status");
      } else {
        res.status(200).json({ id, completed: newStatus });
      }
    });
  });
});
// API to update task and name
app.put("/tasks/:id", (req, res) => {
  const id = req.params.id;
  const { task, name, completed } = req.body;

  if (!task || !name) {
    res.status(400).send("Task and Name are required");
    return;
  }

  // Prepare the SQL query for updating both task and name
  const sql = "UPDATE todos SET task = ?, name = ?, completed = ? WHERE id = ?";
  db.query(sql, [task, name, completed || false, id], (err, result) => {
    if (err) {
      console.error("Error updating task:", err);
      res.status(500).send("Error updating task");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Task not found");
    } else {
      res.status(200).send("Task updated successfully");
    }
  });
});

// Start the server
app.listen(3002, () => {
  console.log("Server is running on http://localhost:3002");
});
