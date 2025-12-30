const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

const API = process.env.API_BASE || 'http://localhost:5001';

(async () => {
  try {
    console.log('Starting E2E signup+upload test...');

    // Create a tiny PNG image in tmp
    const tmpDir = os.tmpdir();
    const imgPath = path.join(tmpDir, `e2e-avatar-${Date.now()}.png`);
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
    fs.writeFileSync(imgPath, Buffer.from(base64, 'base64'));

    // Unique user fields
    const unique = `e2e${Date.now()}`;
    const username = `e2e_user_${unique}`;
    const email = `e2e_user_${unique}@example.com`;
    const password = 'TestPass123';

    // Build multipart form
    const form = new FormData();
    form.append('role', 'user');
    form.append('username', username);
    form.append('email', email);
    form.append('password', password);
    // Use the hyphenated field name to mirror the frontend
    form.append('profile-pic', fs.createReadStream(imgPath));

    console.log('Uploading signup form...');

    const signupRes = await axios.post(`${API}/api/auth/signup`, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 20000
    });

    if (signupRes.status !== 201) {
      console.error('Expected 201 Created from signup but got', signupRes.status);
      process.exit(2);
    }

    const { token, user } = signupRes.data;

    if (!token || !user) {
      console.error('Signup response missing token or user payload');
      console.error('Body:', signupRes.data);
      process.exit(3);
    }

    if (!user.profilePicture || typeof user.profilePicture !== 'string') {
      console.error('Expected profilePicture URL in user object, got:', user.profilePicture);
      process.exit(4);
    }

    console.log('Signup succeeded. profilePicture:', user.profilePicture);

    // Verify the image is served (HEAD request)
    const headRes = await axios.head(user.profilePicture, { timeout: 10000 });
    if (headRes.status !== 200 || !headRes.headers['content-type'] || !headRes.headers['content-type'].startsWith('image')) {
      console.error('Uploaded image is not being served correctly. HEAD response:', headRes.status, headRes.headers['content-type']);
      process.exit(5);
    }

    console.log('Uploaded image is being served (HEAD ok).');

    // Call follow stats endpoint
    console.log('Checking follow stats...');
    const statsRes = await axios.get(`${API}/api/follow/stats/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });

    if (statsRes.status !== 200) {
      console.error('Failed to get follow stats, status:', statsRes.status);
      process.exit(6);
    }

    const stats = statsRes.data;
    console.log('Follow stats:', stats);

    // Basic expectations: counts are numbers (start at 0)
    if (typeof stats.followersCount !== 'number' || typeof stats.followingCount !== 'number') {
      console.error('Follow stats did not contain counts:', stats);
      process.exit(7);
    }

    console.log('E2E signup+upload test passed ✅');
    // Cleanup: remove tmp image
    fs.unlinkSync(imgPath);
    process.exit(0);

  } catch (err) {
    console.error('E2E test failed:', err.message || err);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  }
})();
