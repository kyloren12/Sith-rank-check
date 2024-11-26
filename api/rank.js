const fetch = require('node-fetch');

// Access environment variables for group ID and required rank
const groupId = process.env.GROUP_ID;  // From Vercel's environment variables
const requiredRank = parseInt(process.env.REQUIRED_RANK);  // From Vercel's environment variables

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  // Check if ownerId exists in the request query
  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  try {
    // Fetch group information from Roblox API
    const response = await fetch(`https://api.roblox.com/groups/${groupId}`);

    // If the request fails (status not OK), throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch group data: ${response.statusText}`);
    }

    // Parse the response as JSON
    const groupInfo = await response.json();

    // Check if groupInfo is valid and contains necessary data
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
    console.error("Error fetching group data:", error.message);  // Log the error message
    return res.status(500).json({ success: false, message: "Error fetching group data", error: error.message });
  }
};
