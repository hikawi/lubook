/**
 * Redirects to a URL.
 *
 * This is split to an independent file to let Vitest mock this module,
 * and this function along with it, instead of mocking window.location.href.
 *
 * @param url The URL
 */
export function redirect(url: string) {
  window.location.href = url;
}

/**
 * Sends a GET fetch request with credentials.
 *
 * @param path The path of the API
 * @returns The response
 */
export async function getJson(path: string) {
  return await fetch(`${import.meta.env.PUBLIC_API}/${path}`, {
    method: "GET",
    mode: "cors",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });
}

/**
 * Sends a POST fetch request with the body.
 * @param path The path of the API
 * @param body The body to check
 */
export async function postJson(path: string, body: any) {
  return await fetch(`${import.meta.env.PUBLIC_API}/${path}`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify(body),
    credentials: "include",
  });
}

/**
 * Sends a PUT fetch request.
 * @param path The path of the API
 * @param body The body to send
 * @returns The fetch request
 */
export async function putJson(path: string, body: any) {
  return await fetch(`${import.meta.env.PUBLIC_API}/${path}`, {
    method: "PUT",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify(body),
    credentials: "include",
  });
}

/**
 * Sends a DELETE fetch request.
 * @param path The path of the API
 * @param body The body to send
 * @returns The fetch request
 */
export async function deleteJson(path: string, body: any) {
  return await fetch(`${import.meta.env.PUBLIC_API}/${path}`, {
    method: "DELETE",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify(body),
    credentials: "include",
  });
}

/**
 * Fetches given the data.
 *
 * @param path The API path
 * @param body The body
 */
export async function fetcher(data: {
  path: string;
  body?: any;
  method?: string;
  headers?: any;
}) {
  return await fetch(`${import.meta.env.PUBLIC_API}/${data.path}`, {
    method: data.method,
    mode: "cors",
    headers: data.headers,
    redirect: "follow",
    body: data.body,
    credentials: "include",
  });
}
