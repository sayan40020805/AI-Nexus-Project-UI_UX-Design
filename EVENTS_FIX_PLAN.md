# Plan to Fix 500 Error on Events Page

The 500 Internal Server Error on the events page is caused by invalid data in the database, specifically `likes` on events that are not associated with a user. This causes the backend to crash when it tries to populate the user information for these likes.

Here is the plan to fix this issue:

## 1. Clean the Database

A one-time script is needed to clean the existing bad data from the database.

**Action:** Run the `backend/fix-event-likes.js` script. This script will find all events that have likes with `null` users and remove those likes.

```bash
node backend/fix-event-likes.js
```

## 2. Make the Backend Code More Robust

To prevent this issue from happening in the future, two changes are needed in the backend code.

### a. Enforce Data Integrity in the Schema

The `Event` model should be updated to require a `user` for every `like`.

**File:** `backend/models/Event.js`

**Change:** Add `required: true` to the `user` field in the `likes` array.

```javascript
// from
likes: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}],

// to
likes: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}],
```

Do the same for the `likes` inside the `comments` array.

### b. Restart the Server

After applying the code changes, the backend server must be restarted for the changes to take effect.

**Action:** Stop the current running node server and start it again.

```bash
# Find the process ID (PID) of the running server
ps aux | grep 'node server.js'

# Kill the process
kill <PID>

# Start the server again
cd backend
node server.js
```

## Summary of Actions

1.  Run `node backend/fix-event-likes.js` to clean the database.
2.  Apply the schema changes to `backend/models/Event.js`.
3.  Restart the backend server.

These actions will resolve the 500 error and prevent it from happening again.