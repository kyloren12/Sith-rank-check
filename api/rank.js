// api/rank.js
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  const groupId = 34709432;  // Your target group ID
  const requiredRank = 3;  // The required rank for the game owner

  // Fetch group information from Roblox API
  try {
    const response = await fetch(`https://api.roblox.com/groups/${groupId}`);
    const groupInfo = await response.json();

    if (groupInfo && groupInfo.Owner && groupInfo.Owner.Id === parseInt(ownerId)) {
      // Check if the owner has the required rank
      if (groupInfo.Owner.Rank >= requiredRank) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({ success: false, message: "Insufficient rank" });
      }
    } else {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching group data" });
  }
};
