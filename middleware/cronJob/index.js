// ============================================
// SCHEDULED JOBS - Background Tasks
// ============================================

// Clean expired audio cache (run daily via cron)
export const cleanExpiredCache = async () => {
  try {
    const result = await AudioCache.deleteMany({
      isFavorited: false,
      expiresAt: { $lt: new Date() }
    });
    console.log(`Cleaned ${result.deletedCount} expired audio cache entries`);
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
};

// Reset monthly limits (run on 1st of each month)
export const resetMonthlyLimits = async () => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    await User.updateMany(
      { 'limits.month_key': { $ne: currentMonth } },
      { 
        $set: { 
          'limits.free_plays_used_month': 0,
          'limits.cloned_plays_used_month': 0,
          'limits.month_key': currentMonth
        }
      }
    );
    
    console.log('Monthly limits reset');
  } catch (error) {
    console.error('Monthly reset error:', error);
  }
};

// Schedule jobs (using node-cron in production)
// import cron from 'node-cron';
// cron.schedule('0 0 * * *', cleanExpiredCache); // Daily at midnight
// cron.schedule('0 0 1 * *', resetMonthlyLimits); // 1st of each month