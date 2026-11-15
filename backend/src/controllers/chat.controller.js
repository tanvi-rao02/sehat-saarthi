
const Chat = require('../models/chat');
const Message = require('../models/Message');
const gemini = require('../services/gemini.service');

const setSSE = (res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
};

exports.guestMessage = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    setSSE(res);

    await gemini.streamChat(message, history, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('GUEST CHAT ERROR:', err);

    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    } else {
      res.end();
    }
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.id;

    const recentMsgs = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(20);

    const history = recentMsgs.reverse().map(m => ({
      role: m.role,
      content: m.content
    }));

    await Message.create({
      chat: chatId,
      role: 'user',
      content
    });

    setSSE(res);

    let fullResponse = '';

    await gemini.streamChat(content, history, (chunk) => {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    await Message.create({
      chat: chatId,
      role: 'assistant',
      content: fullResponse
    });

    const isFirst = recentMsgs.length === 0;

    const titleUpdate = isFirst
      ? { title: await gemini.generateTitle(content) }
      : {};

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: fullResponse.slice(0, 100),
      $inc: { messageCount: 2 },
      ...titleUpdate
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChats = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id })
    .sort({ isPinned: -1, updatedAt: -1 });

  res.json({ chats });
};

exports.createChat = async (req, res) => {
  const chat = await Chat.create({ user: req.user._id });

  res.status(201).json({ chat });
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.id })
    .sort({ createdAt: 1 });

  res.json({ messages });
};

exports.renameChat = async (req, res) => {
  const chat = await Chat.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title },
    { new: true }
  );

  res.json({ chat });
};

exports.pinChat = async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  await Chat.findByIdAndUpdate(req.params.id, {
    isPinned: !chat.isPinned
  });

  res.json({ message: 'Updated.' });
};

exports.deleteChat = async (req, res) => {
  await Chat.findByIdAndDelete(req.params.id);
  await Message.deleteMany({ chat: req.params.id });

  res.json({ message: 'Chat deleted.' });
};
