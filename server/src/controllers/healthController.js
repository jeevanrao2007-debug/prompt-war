import { getHealthStatus } from '../services/healthService.js';

export const getHealth = async (req, res, next) => {
  try {
    const status = getHealthStatus();
    res.status(200).json({ message: status });
  } catch (error) {
    next(error);
  }
};
