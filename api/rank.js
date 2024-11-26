const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const noblox = require('noblox.js');
// Access environment variables for group ID and required rank
const groupId = process.env.GROUP_ID;  // From Vercel's environment variables
const requiredRank = parseInt(process.env.REQUIRED_RANK);  // From Vercel's environment variables

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  try {
    console.log(`Fetching groups for user with ID: ${ownerId}`);  // Debugging print
    const response = await fetch(`https://users.roblox.com/v1/users/${ownerId}/groups`);

    // Log the full response for debugging
    const responseBody = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseBody}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user groups for ownerId ${ownerId}: ${response.statusText}`);
    }

    const userGroups = JSON.parse(responseBody);

    const userGroup = userGroups.data.find(group => group.id === parseInt(groupId));
    if (!userGroup) {
      console.log(`User with ID ${ownerId} is not a member of the group.`);  // Debugging print
      return res.status(404).json({ success: false, message: `User with ID ${ownerId} is not a member of the group`, ownerId: ownerId });
    }

    if (userGroup.roleRank >= requiredRank) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: "Insufficient rank", ownerId: ownerId });
    }

  } catch (error) {
    console.error(`Error fetching group data for ownerId ${ownerId}:`, error.message);
    return res.status(500).json({ success: false, message: "Error fetching group data", error: error.message, ownerId: ownerId });
  }
};
