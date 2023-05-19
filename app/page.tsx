"use client"

import React, { useEffect, useState } from 'react';
import './page.scss';
import axios from 'axios';
import { Formik } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil } from '@fortawesome/free-solid-svg-icons'


function App() {
  const [tasks, setTasks] = React.useState<any>(null);
  const [editing, setEditing] = React.useState<any>(null);

  // const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  useEffect(() => {
    console.log(editing)
  }, [editing]);

  useEffect(() => {
    (async () => {
      await getTasks();
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getTasks() {
    const res = await axios.get('/api/tasks');
    setTasks(res.data);
  }

  async function deleteTask(id: string) {
    await axios.delete(`/api/tasks/${id}`);
    await getTasks();
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tasks</h1>
        <Formik
          initialValues={{ task: '', }}
          validate={values => {
            const errors: any = {};
            if (!values.task) {
              errors.task = 'Task required';
            }
            return errors;
          }}
          onSubmit={async (values) => {
            // we are updating a task
            if (editing) {
              const res = await axios.put(`/tasks/${editing._id}`, values);

              const newTasks = tasks.map((task: any) => {
                if (task._id === res.data._id) {
                  return res.data;
                }
                return task;
              });

              setTasks(newTasks);
            } else {
              // adding a new task
              const res = await axios.post('/tasks', values);
              setTasks([...tasks, res.data]);
            }

          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            setFieldTouched
            /* and other goodies */
          }) => (
            <div>
              <ul className='task-list'>
                {tasks && tasks.map((task: any) => (
                  <li className="task-list-item" key={task._id}>
                    <p>{task.task}</p>

                    <div className="task-list-item-button-container">
                      <button className="task-list-item-update-button"
                        onClick={() => {
                          setEditing(task);
                          setFieldValue('task', task.task);
                        }}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                      <button className="task-list-item-delete-button"
                        onClick={() => deleteTask(task._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <form className='task-form' onSubmit={handleSubmit}>
                <input
                  type="task"
                  name="task"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.task}
                />
                <p className='error-message'>
                  {errors.task && touched.task && errors.task}
                </p>

                <button className="submit-button" type="submit" disabled={isSubmitting}>
                  {editing ? 'Update' : 'Add'}
                </button>
                <button className="cancel-button" type="button" onClick={() => {
                  setEditing(null);
                  setFieldValue('task', '');
                  setFieldTouched('task', false);
                }}>Cancel</button>
              </form>
            </div>

          )}
        </Formik>

      </header>
    </div>
  );
}

export default App;
