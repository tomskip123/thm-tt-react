import axios from 'axios';

/**
 * Retrieve all tasks
 *
 * @param {string} token - The access token for authorization
 * @return {Promise} - The Promise object representing the array of tasks
 */
export async function getTasks(token: string) {
  try {
    const res = await axios.get('/api/tasks', {
      headers: {
        'x-access-token': token,
      },
    });
    return res.data; // return only the data, not the entire response
  } catch (error) {
    console.error(error);
    throw error; // propagate the error so it can be handled by the calling code
  }
}

/**
 * Delete a task
 *
 * @param {string} token - The access token for authorization
 * @param {string} id - The ID of the task to be deleted
 * @return {Promise} - The Promise object representing the deletion operation
 */
export async function deleteTask(token: string, id: string) {
  try {
    await axios.delete(`/api/tasks/${id}`, {
      headers: {
        'x-access-token': token,
      },
    });
    return true; // return true to indicate successful deletion
  } catch (error) {
    console.error(error);
    throw error; // propagate the error so it can be handled by the calling code
  }
}

/**
 * Add a new task
 *
 * @param {string} token - The access token for authorization
 * @param {Object} values - The data for the new task to be added
 * @return {Promise} - The Promise object representing the new task
 */
export async function addTask(token: string, values: any) {
  try {
    const res = await axios.post('/api/tasks', values, {
      headers: {
        'x-access-token': token,
      },
    });
    return res.data; // return only the data, not the entire response
  } catch (error) {
    console.error(error);
    throw error; // propagate the error so it can be handled by the calling code
  }
}

/**
 * Update an existing task
 *
 * @param {string} token - The access token for authorization
 * @param {Object} values - The new data for the task to be updated
 * @return {Promise} - The Promise object representing the updated task
 */
export async function updateTask(token: string, values: any) {
  try {
    const { _id, ...task } = values;
    const result = await axios.put(`/api/tasks/${_id}`, task, {
      headers: {
        'x-access-token': token,
      },
    });
    return result.data; // return only the data, not the entire response
  } catch (error) {
    console.error(error);
    throw error; // propagate the error so it can be handled by the calling code
  }
}
