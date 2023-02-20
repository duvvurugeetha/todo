const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initial = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server at http://localhost:3000/");
    });
  } catch (e) {
    console.log("error");
    process.exit(1);
  }
};
initial();
const haspriorityandstatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const haspriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasstatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let query = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case haspriorityandstatus(request.query):
      query = `select * from todo where todo like "%${search_q}%" and status="${status}" and priority="${priority}";`;
      break;
    case haspriority(request.query):
      query = `select * from todo where todo like "%${search_q}%" and priority="${priority}";`;
      break;

    case hasstatus(request.query):
      query = `select * from todo where todo like "%${search_q}%" and status="${status}";`;
      break;
    default:
      query = `select * from todo where todo like "%${search_q}%";`;
  }
  data = await db.all(query);
  response.send(data);
});
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const query = `insert into todo (id,todo,priority,status)values(${id},"${todo}","${priority}","${status}");`;
  const res = await db.run(query);
  response.send("Todo Successfully Added");
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `select * from todo where id=${todoId};`;
  const res = await db.get(query);
  response.send(res);
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
  }
  const previousQuery = `select * from todo where id=${todoId};`;
  const previousTodo = await db.run(previousQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updatedQuery = `update todo set todo="${todo}",
priority="${priority}", status="${status}" where id=${todoId};`;
  const a = await db.run(updatedQuery);
  response.send(`${updatedColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `delete from todo where id=${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
