import { Router } from 'express';

const router = Router();
const CORRECT_PASSWORD = process.env.PASSWORD || 'admin123'; // You can later move this to an environment variable

router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  if (password === CORRECT_PASSWORD) {
    return res.status(200).json({ message: 'Login successful', adminToken:"generateTicketS" });
  } else {
    return res.status(401).json({ message: 'Incorrect password' });
  }

});

export default router;
