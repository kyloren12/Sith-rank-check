try {
    console.log(`Fetching groups for user with ID: ${ownerId}`);
    const response = await fetch(`https://groups.roblox.com/v1/users/${ownerId}/groups/roles`);

    if (!response.ok) {
        const errorMessage = `Failed to fetch groups for ownerId ${ownerId}: ${response.status} ${response.statusText}`;
        console.error(errorMessage);
        sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`);
        return res.status(response.status).json({ success: false, message: "Failed to fetch user groups" });
    }

    const responseBody = await response.json();

    if (!responseBody || !responseBody.data || !Array.isArray(responseBody.data)) {
        const errorMessage = `Unexpected API response structure for ownerId ${ownerId}`;
        console.error(errorMessage);
        sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`);
        return res.status(500).json({ success: false, message: "Invalid response from Roblox API" });
    }

    const userGroup = responseBody.data.find(group => group.group.id === groupId);
    if (!userGroup) {
        const errorMessage = `User with ID ${ownerId} is not a member of the group.`;
        console.log(errorMessage);
        const playerProfileLink = `https://roblox.com/users/${ownerId}/profile`;
        sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}, Profile: ${playerProfileLink}`);
        return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    if (userGroup.role && typeof userGroup.role.rank === "number") {
        if (userGroup.role.rank >= requiredRank) {
            console.log(`User with ID ${ownerId} has sufficient rank.`);
            return res.status(200).json({ success: true });
        } else {
            const errorMessage = `User with ID ${ownerId} has insufficient rank.`;
            console.log(errorMessage);
            sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`);
            return res.status(200).json({ success: false, message: "Insufficient rank" });
        }
    } else {
        const errorMessage = `Invalid role data for user ID ${ownerId}`;
        console.error(errorMessage);
        sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`);
        return res.status(500).json({ success: false, message: "Invalid role data from Roblox API" });
    }
} catch (error) {
    const errorMessage = `Error processing request for ownerId ${ownerId}: ${error.message}`;
    console.error(errorMessage);
    sendWebhookMessage(`Error: ${errorMessage} Player ID: ${ownerId}, Group ID: ${groupId}`);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
}

