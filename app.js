const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
let addDays = require("date-fns/addDays");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API1
const priorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const priorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const statusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const categoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const categoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const categoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { q_search = "", priority, category, status } = request.query;
  switch (true) {
    case priorityAndStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${q_search}%' AND priority = '${priority}' AND status = '${status}';`;
      break;
    case priorityProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${q_search}%' AND priority ='${priority}';`;
      break;
    case statusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${q_search}%' AND status = '${status}';`;
      break;
    case categoryAndStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${q_search}%' AND category = '${category}' AND status ='${status}';`;
      break;
    case categoryProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${q_search}%' AND category='${category}';`;
      break;
    case categoryAndPriorityProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${q_search}%' AND category='${category}' AND priority='${priority}';`;
      break;
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${q_search}%';`;
      break;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});

//API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const data = await db.get(getTodoQuery);
  response.send(data);
});

//API3
app.get("/agenda/", async (request, response) => {
  const { due_date } = request.query;
  const getTodoQuery = `SELECT * FROM todo WHERE due_date=${due_date};`;
  const data = await db.all(getTodoQuery);
  response.send(data);
});

//API4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}','${category}','${dueDate}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date Updated";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category Updated";
      break;
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
