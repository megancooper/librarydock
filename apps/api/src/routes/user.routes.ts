import { Hono } from 'hono';
import {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  toSafeUser,
} from '../services/user.service';

const userRoutes = new Hono();

// GET /api/users - List all users
userRoutes.get('/', async (c) => {
  try {
    const users = await findAllUsers();
    const safeUsers = users.map(toSafeUser);
    return c.json({ data: safeUsers });
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// GET /api/users/:id - Get single user
userRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = await findUserById(id);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json({ data: toSafeUser(user) });
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// POST /api/users - Create new user
userRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.email || !body.password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const existing = await findUserByEmail(body.email);
    if (existing) {
      return c.json({ error: 'User with this email already exists' }, 409);
    }

    const user = await createUser(body);
    return c.json({ data: toSafeUser(user) }, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// PUT /api/users/:id - Update user
userRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const user = await updateUser(id, body);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json({ data: toSafeUser(user) });
  } catch (error) {
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// DELETE /api/users/:id - Delete user
userRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const success = await deleteUser(id);
    if (!success) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

export { userRoutes };
