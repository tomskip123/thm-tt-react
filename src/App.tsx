import React, { useEffect } from 'react';
import './App.scss';
import axios from 'axios';
import { Formik } from 'formik';


function App() {
  const [tasks, setTasks] = React.useState<any>(null);


  useEffect(() => {
    (async () => {
      const res = await axios.get('/tasks');
      setTasks(res.data);
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="App">
      <header className="App-header">
        <h1>Tasks</h1>

        <ul className='task-list'>
          {tasks && tasks.map((task: any) => (
            <li className="task-list-item" key={task._id}>{task.task}</li>
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
