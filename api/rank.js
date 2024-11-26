const fetch = require('node-fetch');

// Access environment variables for group ID and required rank
const groupId = process.env.GROUP_ID;  // From Vercel's environment variables
const requiredRank = parseInt(process.env.REQUIRED_RANK);  // From Vercel's environment variables

const dns = require('dns');

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  try {
    console.log('Checking DNS for api.roblox.com...');
    dns.lookup('api.roblox.com', (err, address, family) => {
      if (err) {
        console.log('DNS resolution failed: ', err);
        return res.status(500).json({ success: false, message: "DNS resolution failed", error: err.message });
      }
      console.log('API domain resolved to:', address);
    });

    // Fetch group information from Roblox API
    const response = await fetch(`https://api.roblox.com/groups/${groupId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch group data: ${response.statusText}`);
    }

    const groupInfo = await response.json();

    if (groupInfo && groupInfo.Owner && groupInfo.Owner.Id === parseInt(ownerId)) {
      if (groupInfo.Owner.Rank >= requiredRank) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({ success: false, message: "Insufficient rank" });
      }
    } else {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }
  } catch (error) {
    console.error("Error fetching group data:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching group data", error: error.message });
  }
};
