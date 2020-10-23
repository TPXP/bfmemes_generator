const fetch = window.fetch;
import {imgur} from '@/../public_settings.json';

// Polyfill fetch if needed
// TODO Test this in IE11 and make sure it is able to upload the image!
async function getFetch() {
  if(fetch)
    return fetch;
  return import('unfetch');
}

export async function imgurFetch(path, token, options) {
  return getFetch().then(fetch => fetch(
    `https://api.imgur.com/3/${path}`,
    {
      ...options,
      headers:{
        ...options?.headers,
        Authorization: token ? `Bearer ${token}` : `Client-ID ${imgur.client_id}`,
      }
    }
  ))
}

export async function uploadImage(blob, token = false) {
  const body = new FormData();
  body.append('image', blob);
  body.append('type', 'file');
  // This endpoint is not documented in the official docs https://apidocs.imgur.com/
  // But it's used in the gifie app, thanks bro <3 https://github.com/eirikb/gifie/blob/gh-pages/app.js#L53
  return imgurFetch('image', token, {
    method: 'POST',
    body,
  })
    .then(r => r.json())
    .then(r => r.data);
}