const fetch = require('node-fetch');
const express = require('express');

const groupId = parseInt(process.env.GROUP_ID, 10); // Ensure environment variables are parsed correctly
const requiredRank = parseInt(process.env.REQUIRED_RANK, 10);

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  try {
    console.log(`Fetching groups for user with ID: ${ownerId}`);
    const response = await fetch(`https://groups.roblox.com/v1/users/${ownerId}/groups/roles`);
    const responseBody = await response.json();

    if (!response.ok) {
      console.error(`Failed to fetch groups for ownerId ${ownerId}:`, response.statusText);
      return res.status(response.status).json({ success: false, message: "Failed to fetch user groups" });
    }

    const userGroup = responseBody.data.find(group => group.group.id === groupId);
    if (!userGroup) {
      console.log(`User with ID ${ownerId} is not a member of the group.`);
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    if (userGroup.role.rank >= requiredRank) {
      console.log(`User with ID ${ownerId} has sufficient rank.`);
      return res.status(200).json({ success: true });
    } else {
      console.log(`User with ID ${ownerId} has insufficient rank.`);
      return res.status(200).json({ success: false, message: "Insufficient rank" });
    }

  } catch (error) {
    console.error(`Error processing request for ownerId ${ownerId}:`, error.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

