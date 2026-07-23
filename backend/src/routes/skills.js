import express from 'express';
import { dbRun, dbGet, dbAll } from '../utils/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all available skills
router.get('/', async (req, res) => {
  try {
    const skills = await dbAll(
      'SELECT * FROM skills ORDER BY category, name'
    );

    console.log('==============================');
    console.log('ALL SKILLS');
    console.table(skills);

    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get skills recommended for a specific mood
router.get('/for-mood/:mood', async (req, res) => {
  try {
    const mood = req.params.mood.toLowerCase();

    const skills = await dbAll(
      "SELECT * FROM skills WHERE for_moods LIKE ? ORDER BY category, name",
      [`%${mood}%`]
    );

    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's tracked skills
router.get('/my-skills', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userSkills = await dbAll(`
      SELECT s.*, us.practiced_count, us.last_practiced
      FROM skills s
      JOIN user_skills us ON s.id = us.skill_id
      WHERE us.user_id = ?
      ORDER BY s.category, s.name
    `, [userId]);

    console.log('==============================');
    console.log('USER:', userId);
    console.log('USER SKILLS');
    console.table(userSkills);

    res.json(userSkills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add skill to user's list
router.post('/my-skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.skillId;

    console.log('==============================');
    console.log('ADD REQUEST');
    console.log('User:', userId);
    console.log('Skill:', skillId);

    const skill = await dbGet(
      'SELECT * FROM skills WHERE id = ?',
      [skillId]
    );

    if (!skill) {
      console.log('❌ Skill existiert nicht');
      return res.status(404).json({ error: 'Skill not found' });
    }

    const existing = await dbGet(
      'SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [userId, skillId]
    );

    console.log('Existing entry:', existing);

    if (existing) {
      console.log('❌ Skill bereits vorhanden');
      return res.status(400).json({
        error: 'Skill already added'
      });
    }

    await dbRun(
      'INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)',
      [userId, skillId]
    );

    console.log('✅ Skill erfolgreich hinzugefügt');

    const afterInsert = await dbAll(
      'SELECT * FROM user_skills WHERE user_id = ?',
      [userId]
    );

    console.log('Aktuelle user_skills:');
    console.table(afterInsert);

    res.status(201).json({
      message: 'Skill added'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Remove skill from user's list
router.delete('/my-skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.skillId;

    await dbRun(
      'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [userId, skillId]
    );

    console.log('Skill entfernt:', skillId);

    res.json({
      message: 'Skill removed'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark skill as practiced
router.post('/my-skills/:skillId/practice', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.skillId;

    await dbRun(
      `UPDATE user_skills
       SET practiced_count = practiced_count + 1,
           last_practiced = CURRENT_TIMESTAMP
       WHERE user_id = ? AND skill_id = ?`,
      [userId, skillId]
    );

    console.log('Skill geübt:', skillId);

    res.json({
      message: 'Skill practiced'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;