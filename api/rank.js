const fetch = require('node-fetch');
const express = require('express');

const groupId = parseInt(process.env.GROUP_ID, 10); // Ensure environment variables are parsed correctly
const requiredRank = parseInt(process.env.REQUIRED_RANK, 10);
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL; // Webhook URL from environment variable

// Function to send message to Discord webhook
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
    sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`); // Send error with player and group ID
    return res.status(400).json({ success: false, message: errorMessage });
  }

  try {
    console.log(`Fetching groups for user with ID: ${ownerId}`);
    const response = await fetch(`https://groups.roblox.com/v1/users/${ownerId}/groups/roles`);
    const responseBody = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to fetch groups for ownerId ${ownerId}: ${response.statusText}`;
      console.error(errorMessage);
      sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`); // Send error with player and group ID
      return res.status(response.status).json({ success: false, message: "Failed to fetch user groups" });
    }

    const userGroup = responseBody.data.find(group => group.group.id === groupId);
    if (!userGroup) {
      const errorMessage = `User with ID ${ownerId} is not a member of the group.`;
      console.log(errorMessage);
      const playerProfileLink = `https://roblox.com/users/${ownerId}/profile`;
      sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}, Profile: ${playerProfileLink}`);

   //   sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`); // Send error with player and group ID
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    if (userGroup.role.rank >= requiredRank) {
      console.log(`User with ID ${ownerId} has sufficient rank.`);
      return res.status(200).json({ success: true });
    } else {
      const errorMessage = `User with ID ${ownerId} has insufficient rank.`;
      console.log(errorMessage);
      sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`); // Send error with player and group ID
      return res.status(200).json({ success: false, message: "Insufficient rank" });
    }

  } catch (error) {
    const errorMessage = `Error processing request for ownerId ${ownerId}: ${error.message}`;
    console.error(errorMessage);
    sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`); // Send error with player and group ID
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
