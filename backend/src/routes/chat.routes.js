const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/chat.controller');

router.post('/guest', ctrl.guestMessage);
router.use(protect);
router.get('/',             ctrl.getChats);
router.post('/',            ctrl.createChat);
router.get('/:id',          ctrl.getMessages);
router.post('/:id/message', ctrl.sendMessage);
router.put('/:id',          ctrl.renameChat);
router.patch('/:id/pin',    ctrl.pinChat);
router.delete('/:id',       ctrl.deleteChat);

module.exports = router;
