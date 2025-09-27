const fetch = require('node-fetch');
const express = require('express');

const groupId = parseInt(process.env.GROUP_ID, 10);
const requiredRank = parseInt(process.env.REQUIRED_RANK, 10);
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

// 🔹 Extra manual check (you can hardcode more if needed)
const extraGroupId = 34419564;      // <-- Oom TGE
const extraRequiredRank = 25;     // <-- replace with required rank for that group
const alwaysAllowedUsers = [944593970, 32404749]; // <-- Oom and pain IRC member

const sendWebhookMessage = async (message) => {
  try {
    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
  } catch (err) {
    console.error('Error sending webhook message:', err.message);
  }
};

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    const errorMessage = `OwnerId is required.`;
    sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`);
    return res.status(400).json({ success: false, message: errorMessage });
  }

  try {
    // ✅ Explicit allow list
    if (alwaysAllowedUsers.includes(Number(ownerId))) {
      console.log(`User ${ownerId} is always allowed.`);
      return res.status(200).json({ success: true, message: "User explicitly allowed" });
    }

    console.log(`Fetching groups for user with ID: ${ownerId}`);
    const response = await fetch(`https://groups.roblox.com/v1/users/${ownerId}/groups/roles`);
    const responseBody = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to fetch groups for ownerId ${ownerId}: ${response.statusText}`;
      console.error(errorMessage);
      sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}, Profile: https://www.roblox.com/users/${ownerId}/profile`);
      return res.status(response.status).json({ success: false, message: "Failed to fetch user groups" });
    }

    // ✅ First check the original env group/rank
    const userGroup = responseBody.data.find(group => group.group.id === groupId);
    if (userGroup && userGroup.role.rank >= requiredRank) {
      console.log(`User with ID ${ownerId} has sufficient rank in main group.`);
      return res.status(200).json({ success: true });
    }

    // ✅ Then check the extra manual group/rank
    const extraGroup = responseBody.data.find(group => group.group.id === extraGroupId);
    if (extraGroup && extraGroup.role.rank >= extraRequiredRank) {
      console.log(`User with ID ${ownerId} has sufficient rank in extra group.`);
      return res.status(200).json({ success: true });
    }

    // If no group passes
    const errorMessage = `User with ID ${ownerId} does not meet group requirements.`;
    console.log(errorMessage);
    sendWebhookMessage(`⚠️ ${errorMessage} Player ID: ${ownerId}, Profile: https://www.roblox.com/users/${ownerId}/profile`);
    return res.status(200).json({ success: false, message: "Insufficient rank or not in group" });

  } catch (error) {
    const errorMessage = `Error processing request for ownerId ${ownerId}: ${error.message}`;
    console.error(errorMessage);
    sendWebhookMessage(`❌ ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}, Profile: https://www.roblox.com/users/${ownerId}/profile`);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
