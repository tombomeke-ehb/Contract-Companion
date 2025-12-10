import bcrypt from 'bcrypt'
import { findUserByEmail, createUser } from '../services/user.service.js'

const SALT_ROUNDS = 10 // SALT_ROUNDS bepaalt hoe sterk het wachtwoord gehasht wordt.
// 10 = standaard niveau: veilig én snel genoeg voor productie.

// REGISTER
// - Check input
// - Check of email al bestaat
// - Hash password
// - Maak nieuwe gebruiker via service
export async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required.' })
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await createUser({ name, email, passwordHash })

    return res.status(201).json({
      message: 'User registered.',
      user
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Register error.' })
  }
}

// LOGIN
// - User zoeken op email
// - Password vergelijken met hash
export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required.' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Login error.' })
  }
}
