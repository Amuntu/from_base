//ngrok http 3000
//node wa_server.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Set your custom security token (replacing Meta's Access Token)
const LOCAL_ACCESS_TOKEN = "my-secret-agent-token-123";

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Local WhatsApp Server is Ready!');
});

// Middleware to mimic Meta's Bearer Authorization Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['x-api-key'];

    // Extract token whether it has 'Bearer ' prefix or not
    let token = authHeader;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token || token !== LOCAL_ACCESS_TOKEN) {
        console.log(`❌ 401 Unauthorized! Received token: "${token}" | Expected: "${LOCAL_ACCESS_TOKEN}"`);
        return res.status(401).json({ error: { message: "Invalid Access Token" } });
    }

    next();
};
/**
 * Endpoint handles both:
 * 1. Simple payloads: { "phone": "...", "message": "..." }
 * 2. Meta API payloads: { "messaging_product": "whatsapp", "to": "...", "text": { "body": "..." } }
 */
app.post('/v1/messages', authenticateToken, async (req, res) => {
    try {
        let recipient = req.body.phone || req.body.to;
        let messageText = req.body.message || (req.body.text && req.body.text.body);

        if (!recipient || !messageText) {
            return res.status(400).json({ error: "Missing required fields (phone/to or message/text)" });
        }

        const cleanNumber = recipient.replace(/[^0-9]/g, '');
        const chatId = `${cleanNumber}@c.us`;

        const sentMsg = await client.sendMessage(chatId, messageText);
        console.log(`[Sent] -> ${cleanNumber}: ${messageText}`);

        // Safely extract message ID (handles different whatsapp-web.js versions)
        const messageId = sentMsg?.id?._serialized || sentMsg?.id?.id || "msg_sent_ok";

        // Return response schema formatted for Meta WhatsApp Cloud API
        res.json({
            messaging_product: "whatsapp",
            contacts: [{ input: recipient, wa_id: cleanNumber }],
            messages: [{ id: messageId, message_status: "accepted" }]
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: { message: error.toString() } });
    }
});

client.initialize();

app.listen(3000, () => {
    console.log('🚀 Local Server running on http://localhost:3000');
});