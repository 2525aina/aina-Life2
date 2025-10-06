import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const sendChatMessageNotification = functions.firestore
  .document("dogs/{petId}/chats/{chatId}")
  .onCreate(async (snapshot, context) => {
    const chatMessage = snapshot.data();
    const petId = context.params.petId;
    const senderId = chatMessage.senderId;
    const senderName = chatMessage.senderName;
    const messageText = chatMessage.messageText;

    // Get pet members
    const petDoc = await db.collection("dogs").doc(petId).get();
    const petData = petDoc.data();

    if (!petData || !petData.members) {
      console.log("Pet or members not found.");
      return null;
    }

    const memberIds = petData.members as string[];

    // Get FCM tokens for all members except the sender
    const recipientTokens: string[] = [];
    for (const memberId of memberIds) {
      if (memberId === senderId) continue; // Don't send notification to the sender

      const userProfileDoc = await db.collection("userProfiles").doc(memberId).get();
      const userProfile = userProfileDoc.data();

      if (userProfile && userProfile.fcmTokens && userProfile.fcmTokens.length > 0) {
        // Filter out duplicate tokens and ensure they are strings
        const uniqueTokens = Array.from(new Set(userProfile.fcmTokens.filter((token: any) => typeof token === 'string')));
        recipientTokens.push(...uniqueTokens);
      }
    }

    if (recipientTokens.length === 0) {
      console.log("No recipient tokens found.");
      return null;
    }

    // Construct the notification message
    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: `${senderName} から ${petData.name} のチャットにメッセージが届きました`, // Pet name is used here
        body: messageText,
        icon: chatMessage.senderProfileImageUrl || '/icon-192x192.png', // Sender's profile image or default
        click_action: `https://aina-life-dev.web.app/chat/pets/${petId}/chat` // URL to open when notification is clicked
      },
      data: {
        petId: petId,
        chatId: snapshot.id,
        url: `https://aina-life-dev.web.app/chat/pets/${petId}/chat`
      }
    };

    // Send notifications to all unique recipient tokens
    try {
      const response = await admin.messaging().sendToDevice(recipientTokens, payload);
      console.log("Successfully sent message:", response);

      // Clean up invalid tokens (optional but recommended)
      const tokensToRemove: Promise<any>[] = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error("Failure sending notification to", recipientTokens[index], error);
          // Cleanup the token from the user's profile
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            const invalidToken = recipientTokens[index];
            tokensToRemove.push(
              db.collection("userProfiles").doc(memberIds[index]).update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(invalidToken)
              })
            );
          }
        }
      });
      await Promise.all(tokensToRemove);

    } catch (error) {
      console.error("Error sending message:", error);
    }

    return null;
  });