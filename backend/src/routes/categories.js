import express from 'express';

const router = express.Router();

// Placeholder routes for categories
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Categories endpoint - under development',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: 'Category detail endpoint - under development',
    data: { id: req.params.id }
  });
});

export default router;
