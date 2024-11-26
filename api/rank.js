const fetch = require('node-fetch');

// Access environment variables for group ID and required rank
const groupId = process.env.GROUP_ID;  // From Vercel's environment variables
const requiredRank = parseInt(process.env.REQUIRED_RANK);  // From Vercel's environment variables

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  try {
    // Fetch user group information using a different Roblox API endpoint
    const response = await fetch(`https://users.roblox.com/v1/users/${ownerId}/groups`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user groups: ${response.statusText}`);
    }

    const userGroups = await response.json();
    
    const userGroup = userGroups.data.find(group => group.id === parseInt(groupId));
    if (!userGroup) {
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    if (userGroup.roleRank >= requiredRank) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: "Insufficient rank" });
    }

  } catch (error) {
    console.error("Error fetching group data:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching group data", error: error.message });
  }
};
