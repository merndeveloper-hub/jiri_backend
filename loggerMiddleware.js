import { pinoInstance } from '../logger.js';

const log = pinoInstance.child({ context: 'userService' });

export async function createUser(userData) {
  try {
    log.info({ userData }, 'Creating new user');
  
  } catch (err) {
    log.error({ err }, 'Error while creating user');
    throw err;
  }
}

import express from 'express';
import { createUser } from '../services/userService.js';

const router = express.Router();

router.post('/users', async (req, res) => {
  try {
    req.log.info('User creation started');
    const user = await createUser(req.body);
    req.log.info('User creation successful');
    res.status(201).json(user);
  } catch (error) {
    req.log.error({ error }, 'User creation failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;





