// Shared fetch -> text -> JSON.parse -> validate pattern that was
// previously duplicated across every page that talks to an API route.

export class FetchJsonError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FetchJsonError";
    this.status = status;
  }
}

type ErrorShaped = {
  message?: string;
  error?: string;
};

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();

  let result: T;

  try {
    result = JSON.parse(responseText) as T;
  } catch {
    throw new FetchJsonError(
      `The server returned an invalid response (${response.status}).`,
      response.status
    );
  }

  if (!response.ok) {
    const errorShaped = result as ErrorShaped;

    const message =
      errorShaped?.message ||
      errorShaped?.error ||
      `Request failed with status ${response.status}.`;

    throw new FetchJsonError(message, response.status);
  }

  return result;
}

export async function fetchJson<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  return parseJsonResponse<T>(response);
}
