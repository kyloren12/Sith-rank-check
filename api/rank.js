const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  try {
    console.log(`Fetching groups for user with ID: ${ownerId}`);
    const response = await fetch(`https://users.roblox.com/v1/users/${ownerId}/groups`);
    
    if (!response.ok) {
      console.error(`Error response body: ${await response.text()}`);  // Log the full response body for debugging
      throw new Error(`Failed to fetch user groups: ${response.statusText}`);
    }

    const userGroups = await response.json();
    const userGroup = userGroups.data.find(group => group.id === parseInt(process.env.GROUP_ID));
    
    if (!userGroup) {
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    if (userGroup.roleRank >= parseInt(process.env.REQUIRED_RANK)) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: "Insufficient rank" });
    }

  } catch (error) {
    console.error("Error fetching group data:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching group data", error: error.message });
  }
};
