// ============================================
// COMPLIANCE APIs - DELETE /app/me/:id
// ============================================

import { findOne, insertNewDocument, updateDocument, deleteManyDocument, deleteDocument } from "../../helpers/index.js";
import axios from "axios";
//import admin from "firebase-admin"; // Assuming Firebase is initialized
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const RUNTIME_API_URL = process.env.RUNTIME_API_URL || "https://api.runtime.com";

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const firebaseUid = req.firebaseUid;

    //  Get user
    const user = await findOne("user", { _id: userId });

    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }

    //  Create deletion job
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job = await insertNewDocument("job", {
      jobId,
      userId: user._id,
     // firebaseUid: firebaseUid,
      type: "delete",
      status: "queued",
      metadata: {
        initiatedAt: new Date().toISOString(),
        userEmail: user.email
      }
    });

  

    //  Delete voice from runtime API (if exists)
    if (user.voiceId) {
      try {
        await axios.delete(`${RUNTIME_API_URL}/runtime/voices/${user.voiceId}`, {
          headers: { 
            'Authorization': req.headers.authorization 
          }
        });
  
      } catch (err) {
        console.error(" Voice deletion error:", err.message);
        // Continue with deletion even if voice API fails
      }
    }

    // Cancel active Stripe subscription (if exists)
    if (user.stripeSubscriptionId) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        console.log(" Stripe subscription cancelled:", user.stripeSubscriptionId);
      } catch (err) {
        console.error(" Stripe cancellation error:", err.message);
      }
    }

    //  Delete all related data using helper functions
    await Promise.all([
      // Delete voice profiles
      deleteManyDocument("voiceProfile", {  userId: user._id }),
      
      // Delete play history
      deleteManyDocument("play", {  userId: user._id }),
      
      // Delete consents
      deleteManyDocument("consent", {  userId: user._id }),
      
      // Delete audio cache
      deleteManyDocument("audioCache", { userId: user._id }),
      
      // Delete subscription transactions
      deleteManyDocument("subscriptionTransaction", { userId: user._id }),
      
      // Delete other jobs (keep current deletion job)
      deleteManyDocument("job", { 
         userId: user._id, 
        type: { $ne: "delete" } 
      })
    ]);

  

    //  Delete user document
    await deleteDocument("user", { _id: user._id });
  

 

    //  Update job status to completed
    await updateDocument("job", { jobId: jobId }, {
      status: "completed",
      metadata: {
        completedAt: new Date().toISOString(),
        deletedUserId: user._id.toString()
      }
    });

    

    return res.status(200).send({
      status: 200,
      message: "Account deleted successfully",
      jobId: jobId,
      deletedData: {
        userId: user._id,
        email: user.email,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(" Error deleting user account:", error);
    
    //  Update job status to failed (if job was created)
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await updateDocument("job", { jobId: jobId }, {
        status: "failed",
        metadata: {
          failedAt: new Date().toISOString(),
          errorMessage: error.message
        }
      });
    } catch (jobErr) {
      console.error("Failed to update job status:", jobErr);
    }

    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred during account deletion."
    });
  }
};

export default deleteUserAccount;