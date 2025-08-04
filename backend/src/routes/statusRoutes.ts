import express, { Router } from 'express';
import {
  getStatusSystem,
  getContextualStatuses,
  changeContentStatus,
  bulkChangeStatus,
  processApproval
} from '../status-system';

const router: Router = express.Router();

// Get complete status system configuration
router.get('/status-system', getStatusSystem);

// Get statuses for specific context
router.get('/status-system/contextual', getContextualStatuses);

// Change content status
router.post('/status-system/change', changeContentStatus);

// Bulk change status
router.post('/status-system/bulk-change', bulkChangeStatus);

// Process approval action (admin only)
router.post('/status-system/approval', processApproval);

export default router;
