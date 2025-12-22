I have identified and fixed a bug in the backend that was causing a 500 Internal Server Error when creating a new post.

The bug was in `backend/routes/posts.js`. The `capabilities` and `useCases` fields were not being parsed correctly when sent from the frontend as comma-separated strings. This was causing a validation error in the database, which was being caught by a generic error handler and resulting in a 500 error.

I have updated the code to correctly parse these fields, similar to how `tags` are handled. This should resolve the issue.

I have modified the following file:
*   `backend/routes/posts.js`