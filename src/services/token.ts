import axios from 'axios';

export const getAccessToken = () => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_HEYGEN_API_KEY || 'MGExNmVhZWFlNmYzNGIzY2FlMjZiOGU0ZTY5MGZkZjUtMTc1NjEzOTc4MQ==',
    },
    body: JSON.stringify({})
  };

  return fetch('https://api.heygen.com/v1/streaming.create_token', options)

}