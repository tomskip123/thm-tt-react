import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.scss';
import axios from 'axios';
import { Formik } from 'formik';


function App() {
  const [tasks, setTasks] = React.useState<any>(null);


  useEffect(() => {
    (async () => {

      const res = await axios.get('/tasks');
      setTasks(res.data);

      console.log(tasks)

    })()
  }, [])


  async function addTask(form: any) {
    console.log(form);

    const res = await axios.post('/tasks', form);

    console.log(res.data)

  }


  return (
    <div className="App">
      <header className="App-header">
        <h1>Tasks</h1>
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
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }, 400);
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
