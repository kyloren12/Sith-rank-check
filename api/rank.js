const fetch = require('node-fetch');

// Access environment variables for group ID and required rank
const groupId = process.env.GROUP_ID;  // From Vercel's environment variables
const requiredRank = parseInt(process.env.REQUIRED_RANK);  // From Vercel's environment variables

module.exports = async (req, res) => {
  const { ownerId } = req.query;

  console.log("Received ownerId:", ownerId);  // Debugging print

  if (!ownerId) {
    return res.status(400).json({ success: false, message: "OwnerId is required" });
  }

  try {
    // Fetch user group information
    console.log(`Fetching groups for user with ID: ${ownerId}`);  // Debugging print
    const response = await fetch(`https://users.roblox.com/v1/users/${ownerId}/groups`);
    console.log("API Response Status:", response.status);  // Debugging print

    // Check if the response is successful
    if (!response.ok) {
      // Log the response body for debugging purposes
      const errorBody = await response.text();
      console.error("Error response body:", errorBody);  // Debugging print
      throw new Error(`Failed to fetch user groups for ownerId ${ownerId}: ${response.statusText}`);
    }

    const userGroups = await response.json();
    console.log("User Groups Data:", JSON.stringify(userGroups, null, 2));  // Pretty print user group data

    const userGroup = userGroups.data.find(group => group.id === parseInt(groupId));
    if (!userGroup) {
      console.log(`User with ID ${ownerId} is not a member of the group.`);  // Debugging print
      return res.status(404).json({ success: false, message: `User with ID ${ownerId} is not a member of the group` });
    }

    console.log("User group found:", userGroup);  // Debugging print

    if (userGroup.roleRank >= requiredRank) {
      console.log("User has sufficient rank.");  // Debugging print
      return res.status(200).json({ success: true });
    } else {
      console.log("User does not have sufficient rank.");  // Debugging print
      return res.status(200).json({ success: false, message: "Insufficient rank" });
    }

  } catch (error) {
    console.error("Error fetching group data for ownerId", ownerId, ":", error.message);
    return res.status(500).json({ success: false, message: "Error fetching group data", error: error.message, ownerId: ownerId });
  }
};
