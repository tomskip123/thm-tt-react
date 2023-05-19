import React, { useEffect } from 'react';
import './App.scss';
import axios from 'axios';
import { Formik } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'


function App() {
  const [tasks, setTasks] = React.useState<any>(null);


  useEffect(() => {
    (async () => {
      await getTasks();
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getTasks() {
    const res = await axios.get('/tasks');
    setTasks(res.data);
  }

  async function deleteTask(id: string) {
    await axios.delete(`/tasks/${id}`);
    await getTasks();
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tasks</h1>

        <ul className='task-list'>
          {tasks && tasks.map((task: any) => (
            <li className="task-list-item" key={task._id}>
              <p>{task.task}</p>

              <button className="task-list-item-delete-button"
                onClick={() => deleteTask(task._id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
        </ul>
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
            const res = await axios.post('/tasks', values);

            setTasks([...tasks, res.data]);
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
                Submit
              </button>
            </form>
          )}
        </Formik>

      </header>
    </div>
  );
}

export default App;
