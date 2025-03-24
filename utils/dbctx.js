import React, { createContext, useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "todo.db";
const TaskDatabaseContext = createContext();

export const TaskDatabaseProvider = ({ children }) => {
  const [database, setDatabase] = useState(null);
  const [taskList, setTaskList] = useState([]);

  useEffect(() => {
    const initDatabase = () => {
      const db = SQLite.openDatabase(DATABASE_NAME);
      setDatabase(db);

      db.transaction(tx => {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT);",
          [],
          () => {
            console.log("📦 Tabla 'tasks' creada o ya existe");
            obtenerTareas(db);
          },
          (_, error) => {
            console.error("❌ Error creando la tabla:", error);
            return false;
          }
        );
      });
    };

    initDatabase();
  }, []);

  const obtenerTareas = (dbRef = database) => {
    if (!dbRef) return;
    dbRef.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM tasks;",
        [],
        (_, { rows }) => {
          setTaskList(rows._array);
        },
        (_, error) => {
          console.error("❌ Error al obtener tareas:", error);
          return false;
        }
      );
    });
  };

  const agregarTarea = (nuevaTarea) => {
    if (!database) return;
    database.transaction(tx => {
      tx.executeSql(
        "INSERT INTO tasks (task) VALUES (?);",
        [nuevaTarea],
        () => obtenerTareas(),
        (_, error) => {
          console.error("❌ Error al agregar tarea:", error);
          return false;
        }
      );
    });
  };

  const actualizarTarea = (tareaId, tareaActualizada) => {
    if (!database) return;
    database.transaction(tx => {
      tx.executeSql(
        "UPDATE tasks SET task = ? WHERE id = ?;",
        [tareaActualizada, tareaId],
        () => obtenerTareas(),
        (_, error) => {
          console.error("❌ Error al actualizar tarea:", error);
          return false;
        }
      );
    });
  };

  const eliminarTarea = (tareaId) => {
    if (!database) return;
    database.transaction(tx => {
      tx.executeSql(
        "DELETE FROM tasks WHERE id = ?;",
        [tareaId],
        () => obtenerTareas(),
        (_, error) => {
          console.error("❌ Error al eliminar tarea:", error);
          return false;
        }
      );
    });
  };

  return (
    <TaskDatabaseContext.Provider
      value={{
        taskList,
        agregarTarea,
        actualizarTarea,
        eliminarTarea,
      }}
    >
      {children}
    </TaskDatabaseContext.Provider>
  );
};

export default TaskDatabaseContext;
