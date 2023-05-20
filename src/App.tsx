import React, { useEffect } from 'react';
import './App.scss';
import axios from 'axios';
import { Formik } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil } from '@fortawesome/free-solid-svg-icons'


function App() {
  const [token, setToken] = React.useState<any>(false);

  const [tasks, setTasks] = React.useState<any>(null);
  const [editing, setEditing] = React.useState<any>(null);

  useEffect(() => {
    console.log(editing)
  }, [editing]);

  useEffect(() => {
    (async () => {
      // check if user is authenticated 
      await checkAuth();

      if (token) {
        await getTasks();
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkAuth() {
    const token = localStorage.getItem('token')
    if (!token) {
      return;
    } else {
      try {
        const res = await axios.get('/validate', {
          headers: {
            'x-access-token': token
          }
        });
        setToken(token)
      } catch (error) {
        // console.log(error)
      }
    }
  }


  async function getTasks() {
    try {
      const res = await axios.get('/tasks', {
        headers: {
          'x-access-token': token
        }
      });
      setTasks(res.data);
    } catch (error) {
      // console.log(error)
    }
  }

  async function deleteTask(id: string) {
    try {
      await axios.delete(`/tasks/${id}`, {
        headers: {
          'x-access-token': token,
        }
      });
      await getTasks();
    } catch (error) {
      // console.log(error)
    }
  }

  if (!token) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Login</h1>
          <Formik
            initialValues={{ email: '', password: '' }}
            validate={values => {
              const errors: any = {};
              if (!values.email) {
                errors.email = 'Required';
              } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
              ) {
                errors.email = 'Invalid email address';
              }
              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const res = await axios.post('/login', values);
                console.log(res.data)
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
              } catch (error) {
                // console.log(error)
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
              /* and other goodies */
            }) => (
              <form className='task-form' onSubmit={handleSubmit}>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                />
                <p className='error-message'>
                  {errors.email && touched.email && errors.email}
                </p>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                />
                <p className='error-message'>
                  {errors.password && touched.password && errors.password}
                </p>
                <button type="submit" disabled={isSubmitting}>
                  Submit
                </button>
              </form>
            )}
          </Formik>
        </header>
      </div>
    )
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
              const res = await axios.put(`/tasks/${editing._id}`, values, {
                headers: {
                  'x-access-token': token,
                }
              });

              const newTasks = tasks.map((task: any) => {
                if (task._id === res.data._id) {
                  return res.data;
                }
                return task;
              });

              setTasks(newTasks);
            } else {
              // adding a new task
              const res = await axios.post('/tasks', values, {
                headers: {
                  'x-access-token': token,
                }
              });
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
