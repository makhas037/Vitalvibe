import { google } from 'googleapis';

const FITNESS_SCOPES = ['https://www.googleapis.com/auth/fitness.activity.read'];

// Get Google Fit data
export const getGoogleFitData = async (accessToken) => {
try {
 const fitness = google.fitness({
   version: 'v1',
   auth: accessToken
 });

 const now = new Date();
 const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

 const response = await fitness.users.dataset.aggregate({
   userId: 'me',
   requestBody: {
     aggregateBy: [
       {
         dataTypeName: 'com.google.step_count.delta',
         dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
       },
       {
         dataTypeName: 'com.google.calories.expended',
         dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms'
       },
       {
         dataTypeName: 'com.google.heart_rate.bpm',
         dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms'
       },
       {
         dataTypeName: 'com.google.sleep.segment',
         dataSourceId: 'derived:com.google.sleep.segment:com.google.android.gms'
       }
     ],
     bucketByTime: { durationMillis: 86400000 }, // 24 hours
     startTimeMillis: startTime.getTime(),
     endTimeMillis: now.getTime()
   }
 });

 const buckets = response.data.bucket || [];
 let stats = {
   steps: 0,
   calories: 0,
   heartRate: 0,
   sleep: 0,
   source: 'Google Fit'
 };

 buckets.forEach(bucket => {
   bucket.dataset?.forEach(dataset => {
     dataset.point?.forEach(point => {
       if (dataset.dataTypeName === 'com.google.step_count.delta') {
         stats.steps += point.value[0]?.intVal || 0;
       }
       if (dataset.dataTypeName === 'com.google.calories.expended') {
         stats.calories += point.value[0]?.fpVal || 0;
       }
       if (dataset.dataTypeName === 'com.google.heart_rate.bpm') {
         stats.heartRate = point.value[0]?.fpVal || 0;
       }
       if (dataset.dataTypeName === 'com.google.sleep.segment') {
         stats.sleep += point.value[0]?.intVal || 0;
       }
     });
   });
 });

 return stats;
} catch (error) {
 console.error('Google Fit API error:', error);
 throw error;
}
};

export default { getGoogleFitData };
