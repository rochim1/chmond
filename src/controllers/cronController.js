const cron = require('node-cron');
const moment = require('moment');
// const { sendNotification } = require('./notificationService');
const ChemoSchedule = require("../models/chemoSchModel");

const listCronJobs = [{
    trigger_name: "consume_drug_notif",
    trigger_date: `0 0 23 31 12 *`,
    func: ['triggerConsumeDrugNotif']
}, {
    trigger_name: "update_chemo_terapy_notif",
    trigger_date: `0 0 0 * * *`,
    func: ['triggerChemoTerapyNotif']
}];

// *****************************************************************************
const initializeCronJobs = () => {
    // Initialize cron jobs at server start
    initializeImmediatlyNotifSchdule(); // Start jobs immediately at server start

    // Schedule the job to recheck and update all jobs every midnight
    initializeMidnightJob();
};

let jobs = {}

const triggerConsumeDrugNotif = () => {

}

const triggerUnknownEndDrugConsume = () => {

}

const initializeMidnightJob = () => {
    // Schedule the job to run every midnight
    const notificationTime = listCronJobs.filter(data => data.trigger_name == "update_chemo_terapy_notif");
    const job = cron.schedule(notificationTime, () => {
        initializeImmediatlyNotifSchdule(); // Call the function to stop and update jobs at midnight
    });

    console.log('Midnight cron job initialized.');
};

const initializeImmediatlyNotifSchdule = () => {
    try {
        // Stop all current scheduled jobs
        stopAllJobs();

        // Fetch and reschedule all chemotherapy notifications
        triggerChemoTerapyNotif();

        console.log("All chemotherapy notification jobs have been reinitialized.");
    } catch (error) {
        console.log('Failed to update chemotherapy cron jobs', error);
    }
};

// Function to trigger chemotherapy notifications
const triggerChemoTerapyNotif = async (req, res) => {
    try {
        const chunkSize = 100;
        let offset = 0;
        let hasMoreData = true;

        while (hasMoreData) {
            // Fetch a chunk of data using limit and offset
            const schedules = await ChemoSchedule.findAll({
                limit: chunkSize,
                offset: offset,
                order: [
                    ['id_chemoSchedule', 'ASC']
                ], // Ensure data is ordered to avoid missing/overlapping rows
            });

            // If no more data is returned, exit the loop
            if (schedules.length === 0) {
                hasMoreData = false;
                break;
            }

            // Process each schedule
            for (let schedule of schedules) {
                // Schedule notifications for each schedule
                await scheduleNotification(schedule);
            }

            // Move to the next chunk
            offset += chunkSize;
        }
    } catch (error) {
        console.error('Error triggering chemotherapy notifications:', error);
    }
};

// Function to schedule a notification for a specific schedule
const scheduleNotification = async (schedule) => {
    try {
        const chemoDateTime = moment(`${schedule.tanggal_kemoterapi} ${schedule.waktu_kemoterapi}`, 'YYYY-MM-DD HH:mm');

        // Format the datetime to match the cron format (seconds minutes hours day month day-of-week)
        const notificationTime = chemoDateTime.format('s m H D M *');

        // Schedule a job based on the user's notification time
        const job = cron.schedule(notificationTime, () => {
            // Call the notification sending logic here
            sendNotification(schedule);
        });

        // Store the job instance with the schedule for later updates or stopping
        jobs[schedule.id_chemoSchedule] = job;
        
        // Return the job instance if needed
        return job;
    } catch (error) {
        console.error(`Error scheduling notification: ${error.message}`);
    }
};

// Function to stop a scheduled job (e.g., on update)
const stopScheduledJob = (scheduleId) => {
    const job = jobs[scheduleId];
    if (job) {
        job.stop(); // Stop the cron job
        delete jobs[scheduleId]; // Remove the job from the in-memory store
    }
};

const stopAllJobs = () => {
    Object.keys(jobs).forEach(scheduleId => {
        if (jobs[scheduleId]) {
            jobs[scheduleId].stop(); // Stop the job
            console.log(`Job for schedule ${scheduleId} stopped`);
        }
    });
    
    // Clear all jobs from the in-memory store
    Object.keys(jobs).forEach(scheduleId => delete jobs[scheduleId]);

    console.log('All jobs have been stopped.');
};
// Function to update notification schedule
const updateNotificationSchedule = async (schedule) => {
    // Stop the existing job
    stopScheduledJob(schedule.id_chemoSchedule);

    // Schedule a new notification with updated time
    await scheduleNotification(schedule);
};

// Function to send notifications (SMS, Email, Push Notification, etc.)
const sendNotification = (schedule) => {
    // Implement your notification logic (e.g., using SMS, email, or push notifications)
    console.log(`Sending chemotherapy reminder to user: ${schedule.id_user} for schedule ID: ${schedule.id_chemoSchedule}`);
};

module.exports = {
    initializeCronJobs,
    triggerChemoTerapyNotif,
    scheduleNotification,
    updateNotificationSchedule,
    sendNotification,
};