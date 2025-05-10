const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// In-memory user store for demo (instead of MongoDB)
const users = [];

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      assessments: [],
      createdAt: new Date(),
    };
    users.push(user);
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/assessments', auth, async (req, res) => {
  try {
    const assessment = new Assessment({
      ...req.body,
      user: req.user._id,
    });

    await assessment.save();
    req.user.assessments.push(assessment._id);
    await req.user.save();

    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assessment' });
  }
});

app.get('/api/assessments', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user._id });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessments' });
  }
});

app.post('/api/payment', auth, async (req, res) => {
  try {
    const { paymentMethodId, assessmentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4999, // $49.99
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      res.json({ success: true });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment' });
  }
});

app.get('/api/generate-letter/:assessmentId', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.assessmentId,
      user: req.user._id,
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Here we'll add the PDF generation logic
    res.json({
      success: true,
      assessment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating letter' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 