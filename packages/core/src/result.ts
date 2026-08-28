/*
  Rust-like Result

  There are cases when we need to
  1. Treat an error immediately because it is important.
      Ex: 429 Too Many Requests vs 500 Internal Server Error
          429: I want to wait the window and then re-call the API
          500: Something bad happened, route messages to dead letter queue

  2. Map one error to many promise rejections
    Because emails are individually send to our Message Broker
    And then we queue them to be bulk sent
*/

export type Result<T, K extends Error> = GoodResult<T> | BadResult<K>;

export type GoodResult<T> = T extends void
  ? {
      success: true;
    }
  : {
      success: true;
      value: T;
    };

export type BadResult<K extends Error> = {
  success: false;
  error: K;
};
