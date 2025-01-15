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
