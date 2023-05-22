import { TextField, Button, Box, Container, Alert } from '@mui/material';
import { Delete } from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridCellParams
} from '@mui/x-data-grid';
import axios from 'axios';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import './App.scss';
import { addTask, deleteTask, getTasks, updateTask } from '../http/Task';
import { getUsers } from '../http/User';


function Home() {
  // Use string | null for token and editing. Initialize as null.
  const [token, setToken] = React.useState<string | null>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [ws, setWs] = React.useState<any>(null);


  // This effect hook runs once when the component is mounted.
  // It creates a new WebSocket connection to the specified server 
  // and stores it in the state variable 'ws' for later use.
  useEffect(() => {
    if (token) {
      let websocket = new WebSocket('wss://thm-tt-node.herokuapp.com/');
      setWs(websocket);
    }
  }, [token]);

  // This effect hook runs every time 'ws' (the WebSocket instance) changes.
  // It sets up event handlers for the 'open', 'message', 'error', and 'close' events.
  useEffect(() => {

    // If 'ws' is not null (i.e., a WebSocket connection has been established)
    if (ws) {

      // This function is called when the WebSocket connection is successfully established
      ws.onopen = () => {
        console.log('Connected to WS server');
      };

      // This function is called every time a message is received from the WebSocket server
      ws.onmessage = handleWsMessage

      // This function is called if an error occurs on the WebSocket
      ws.onerror = (e: any) => {
        console.error('WebSocket error:', e);
      };

      // This function is called when the WebSocket connection is closed
      ws.onclose = (e: any) => {
        console.log('WebSocket connection closed');
      };
    }

    // The return function of a useEffect hook is called when the component unmounts.
    // Here, we're making sure to close the WebSocket connection when that happens.
    return () => {
      if (ws) ws.close();
    };
  }, [ws]); // 'ws' is a dependency of this effect hook, so it will run every time 'ws' changes.

  async function handleWsMessage(e: any) {
    // Handle incoming messages here
    // 'e.data' contains the data sent from the server.
    // Here we assume it's a JSON string, which we parse into a JavaScript object.
    const data = JSON.parse(e.data);

    console.log(data);

    if (token) {
      const tasks = await getTasks(token);
      setTasks(tasks);
    }

  }


  // Fetch tasks only when token changes.
  useEffect(() => {
    (async () => {
      await checkAuth();
      if (token) {
        setUsers(await getUsers(token));
        setTasks(await getTasks(token));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Function to check authentication.
  async function checkAuth() {
    const localToken = localStorage.getItem('token');
    if (!localToken) {
      return;
    }
    try {
      await axios.get('/api/validate', {
        headers: {
          'x-access-token': localToken,
        },
      });
      setToken(localToken);
    } catch (error) {
      console.error(error);
      // If validation fails, remove token from local storage.
      localStorage.removeItem('token');
    }
  }
  // The LoginForm component
  const LoginForm = ({
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue
  }: any) => (
    <form className='login-form' onSubmit={handleSubmit}>
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
  );

  // If user is not authenticated
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
            onSubmit={async (values, { setSubmitting, setFieldValue }) => {
              try {
                const res = await axios.post('/api/login', values);
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
                setFieldValue('password', ''); // Clear password field
              } catch (error) {
                // Handle error here
                console.error(error);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {LoginForm}
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
      type: 'singleSelect',
      valueOptions: ['todo', 'in-progress', 'done'],
      editable: true,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 300,
      type: 'singleSelect',
      valueOptions: ['low', 'medium', 'high'],
      editable: true,
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      width: 300,
      type: 'singleSelect',
      valueOptions: users.map((user: any) => user.email),
      editable: true,
    },
    {
      field: 'actions',
      headerName: "Actions",
      renderCell: (params: GridCellParams) => (
        <Button onClick={(e) => handleDelete(params.id)}>
          <Delete style={{ color: "red" }}></Delete>
        </Button>
      ),
    }
  ];

  // Function to delete a task.
  const handleDelete = async (id: any) => {
    try {
      await deleteTask(token, id);
      // Filter out the deleted task.
      setTasks(tasks.filter((task: any) => task.id !== id));
    } catch (error) {
      console.error(error);
      // Show a meaningful error message to the user.
    }
  };


  const TaskForm = ({
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
  }: any) => (
    <div>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          id="task-input"
          label="Task"
          variant="outlined"
          margin="normal"
          fullWidth
          type="task"
          name="task"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.task}
          error={Boolean(touched.task && errors.task)}
          helperText={touched.task && errors.task}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {editing ? 'Update' : 'Add'}
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="secondary"
          onClick={() => {
            setEditing(null);
            setFieldValue('task', '');
            setFieldTouched('task', false);
          }}
        >
          Cancel
        </Button>
      </Box>

      {tasks && (
        <DataGrid
          style={{ width: '100%', height: 500 }}
          rows={tasks?.map((task: any) => ({ ...task, id: task._id, status: task.status || '', priority: task.priority || 'low', assignee: task.assignee || '' })).reverse()}
          columns={columns}
          processRowUpdate={async (newRow: any) => {
            const updatedRow = { ...newRow, isNew: false };
            await updateTask(token, updatedRow);
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

  );

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
        onSubmit={async (values, { resetForm }) => {
          try {
            const res = await addTask(token, values);
            setTasks(await getTasks(token));

            // Reset the form after submission.
            resetForm();
          } catch (error) {
            console.error(error);
            // Show a meaningful error message to the user.
          }
        }}
      >
        {TaskForm}
      </Formik>
    </Container>
  );
}

export default Home;
