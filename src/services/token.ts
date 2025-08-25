export const getAccessToken = () => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_HEYGEN_API_KEY || 'NWFhYzQ0ZWM5MDlmNDhjNTg5MjU1YWI1YTJhYmFkMWYtMTc1NjE1NTgzMg==',
    },
    body: JSON.stringify({})
  };

  return fetch('https://api.heygen.com/v1/streaming.create_token', options)

}