import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Delete } from '@mui/icons-material'
import {
  DataGrid,
  GridColDef,
  GridCellParams
} from '@mui/x-data-grid';

import axios from 'axios';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import './App.scss';

function Home() {
  const [token, setToken] = React.useState<any>(false);

  const [tasks, setTasks] = React.useState<any>([]);
  const [editing, setEditing] = React.useState<any>(null);

  useEffect(() => {
    (async () => {
      // check if user is authenticated 
      await checkAuth();

      if (token) {
        await getTasks();
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 300 },
    {
      field: 'task',
      headerName: 'Task',
      width: 300,
      editable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 300,
      editable: true,
    },
    {
      field: 'actions',
      headerName: "Actions",
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => deleteTask(params.id as any)}>
          <Delete style={{ color: "red" }}></Delete>
        </Button>
      ),
    }
  ];


  return (
    <Container>
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

          // adding a new task
          const res = await axios.post('/tasks', values, {
            headers: {
              'x-access-token': token,
            }
          });
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
          setFieldValue,
          setFieldTouched
          /* and other goodies */
        }) => (
          <div>
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

            {tasks && (
              <DataGrid
                style={{ width: '100%', height: 500 }}
                rows={tasks?.map((task: any) => ({ ...task, id: task._id }))}
                columns={columns}
                processRowUpdate={async (newRow: any) => {
                  const updatedRow = { ...newRow, isNew: false };
                  //handle send data to api
                  const { _id, ...task } = updatedRow;
                  await axios.put(`/tasks/${_id}`, task, {
                    headers: {
                      'x-access-token': token,
                    }
                  });
                  return updatedRow;
                }}
                editMode="row"
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10]}
              />
            )}
          </div>

        )}
      </Formik>
    </Container>
  );
}

export default Home;
