import axios from 'axios';

/**
 * Retrieve all users
 *
 * @param {string} token - The access token for authorization
 * @return {Promise} - The Promise object representing the array of users
 */
export async function getUsers(token: string) {
  try {
    const res = await axios.get('/users', {
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
