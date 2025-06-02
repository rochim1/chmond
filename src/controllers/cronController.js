const cron = require('node-cron');
const moment = require('moment');
const momentz = require('moment-timezone');
const ChemoSchedule = require("../models/chemoSchModel");
const { DrugSchedule, DrugConsumeTime } = require('../models/index');
const NotificationSent = require('../models/notificationSentModel');
const notificationController = require('./notificationController');
const Users = require('../models/userModel');

const listCronJobs = [
  {
    trigger_name: "consume_drug_notif",
    trigger_date: "0 0 23 31 12 *", // At 23:00 31 December every year
    func: ["triggerConsumeDrugNotif"]
  },
  {
    trigger_name: "update_chemo_terapy_notif",
    trigger_date: "0 0 0 * * *", // Every midnight
    func: ["triggerChemoTerapyNotif"]
  }
];

let chemo_jobs = {};
let drug_jobs = {};

// Initialize all cron jobs
const initializeCronJobs = () => {
  initializeImmediatelyNotifSchedule();
  initializeImmediatelyNotifScheduleDrug();
  initializeMidnightJob();
  console.log('Cron jobs initialized');
};

const initializeMidnightJob = () => {
  const cronInfo = listCronJobs.find(data => data.trigger_name === "update_chemo_terapy_notif");
  const trigger_date = cronInfo.trigger_date;

  cron.schedule(trigger_date, () => {
    console.log('Running midnight job to refresh chemo schedules');
    initializeImmediatelyNotifSchedule();
    initializeImmediatelyNotifScheduleDrug();
  });

  console.log('Midnight cron job scheduled.');
};

const initializeImmediatelyNotifSchedule = () => {
  try {
    stopAllJobs('chemotherapy');
    triggerChemoTerapyNotif();
    console.log("Chemotherapy notification jobs reinitialized.");
  } catch (error) {
    console.error('Failed to initialize chemotherapy cron jobs:', error);
  }
};

const initializeImmediatelyNotifScheduleDrug = () => {
  try {
    stopAllJobs('drug_consume_time');
    triggerDrugNotif();
    console.log("Drug consume time notification jobs reinitialized.");
  } catch (error) {
    console.error('Failed to initialize drug consume time cron jobs:', error);
  }
};

const triggerChemoTerapyNotif = async () => {
  try {
    const chunkSize = 100;
    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const schedules = await ChemoSchedule.findAll({
        limit: chunkSize,
        offset,
        order: [['updatedAt', 'DESC']],
        where: { status: 'active', is_sent: false }
      });

      if (schedules.length === 0) {
        hasMoreData = false;
        break;
      }

      for (const schedule of schedules) {
        // Calculate notification time, subtracting remember_before_minutes
        let notifTime = momentz.tz(`${schedule.tanggal_kemoterapi} ${schedule.waktu_kemoterapi}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');
        if (schedule.remember_before_minutes) {
          notifTime = notifTime.subtract(schedule.remember_before_minutes, 'minutes');
        }
        notifTime = notifTime.startOf('minute');

        // Schedule only if notification time is now or future
        if (notifTime.isSameOrAfter(momentz().tz('Asia/Jakarta').startOf('minute'))) {
          await scheduleNotification(schedule, 'chemotherapy');
        }
      }
      offset += chunkSize;
    }
  } catch (error) {
    console.error('Error triggering chemotherapy notifications:', error);
  }
};

const triggerDrugNotif = async () => {
  try {
    const chunkSize = 100;
    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const schedules = await DrugConsumeTime.findAll({
        limit: chunkSize,
        offset,
        order: [['updatedAt', 'DESC']],
        where: { status: 'active', is_sent: false }
      });

      if (schedules.length === 0) {
        hasMoreData = false;
        break;
      }

      for (const schedule of schedules) {
        let notifTime = momentz.tz(`${schedule.date} ${schedule.time}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta').startOf('minute');

        if (notifTime.isSameOrAfter(momentz().tz('Asia/Jakarta').startOf('minute'))) {
          await scheduleNotification(schedule, 'drug_consume_time');
        }
      }
      offset += chunkSize;
    }
  } catch (error) {
    console.error('Error triggering drug consume notifications:', error);
  }
};

const scheduleNotification = async (schedule, tipe) => {
  try {
    let job;
    let scheduleDateTime;

    if (tipe === 'chemotherapy') {
      scheduleDateTime = momentz.tz(`${schedule.tanggal_kemoterapi} ${schedule.waktu_kemoterapi}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');

      if (schedule.remember_before_minutes) {
        scheduleDateTime = scheduleDateTime.subtract(schedule.remember_before_minutes, 'minutes');
      }
    } else if (tipe === 'drug_consume_time') {
      scheduleDateTime = momentz.tz(`${schedule.date} ${schedule.time}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');
    } else {
      console.warn('Unknown notification type:', tipe);
      return;
    }

    // Format to cron syntax: second, minute, hour, day of month, month, day of week
    // node-cron expects 6 fields: second, minute, hour, day, month, dayOfWeek
    const cronTime = scheduleDateTime.format('s m H D M *');
    
    job = cron.schedule(cronTime, async () => {
      console.log(`Executing cron job for ${tipe} notification at ${cronTime}`);
      await sendNotification(schedule, tipe);
    });

    if (tipe === 'chemotherapy') {
      chemo_jobs[schedule.id_chemoSchedule] = job;
    } else if (tipe === 'drug_consume_time') {
      drug_jobs[schedule.id_drug_consume_time] = job;
    }

    return job;

  } catch (error) {
    console.error(`Error scheduling notification for ${tipe}:`, error);
  }
};

const stopScheduledJob = (scheduleIdOrObj, tipe) => {
  let scheduleId;
  if (typeof scheduleIdOrObj === 'object') {
    scheduleId = tipe === 'chemotherapy' ? scheduleIdOrObj.id_chemoSchedule : scheduleIdOrObj.id_drug_consume_time;
  } else {
    scheduleId = scheduleIdOrObj;
  }

  if (tipe === 'chemotherapy' && chemo_jobs[scheduleId]) {
    chemo_jobs[scheduleId].stop();
    delete chemo_jobs[scheduleId];
    console.log(`Stopped chemotherapy job with id ${scheduleId}`);
  } else if (tipe === 'drug_consume_time' && drug_jobs[scheduleId]) {
    drug_jobs[scheduleId].stop();
    delete drug_jobs[scheduleId];
    console.log(`Stopped drug consume time job with id ${scheduleId}`);
  }
};

const stopAllJobs = (tipe) => {
  if (tipe === 'chemotherapy') {
    Object.keys(chemo_jobs).forEach(scheduleId => {
      chemo_jobs[scheduleId].stop();
      console.log(`Stopped chemotherapy job ${scheduleId}`);
      delete chemo_jobs[scheduleId];
    });
  } else if (tipe === 'drug_consume_time') {
    Object.keys(drug_jobs).forEach(scheduleId => {
      drug_jobs[scheduleId].stop();
      console.log(`Stopped drug consume job ${scheduleId}`);
      delete drug_jobs[scheduleId];
    });
  }
  console.log(`All ${tipe} jobs stopped.`);
};

const updateNotificationSchedule = async (schedule, tipe = 'chemotherapy') => {
  stopScheduledJob(schedule, tipe);
  await scheduleNotification(schedule, tipe);
};

const sendNotification = async (schedule, tipe) => {
  try {
    const user = await Users.findOne({
      where: {
        id_user: schedule.id_user,
        status: 'active'
      }
    });

    if (!user || !user.fcm_token) {
      console.log('No user or FCM token found for user id:', schedule.id_user);
      return;
    }

    let attribute;
    if (tipe === 'chemotherapy') {
      attribute = {
        fcm_token: user.fcm_token,
        title: '⏰ Pengingat Jadwal Kunjungan',
        body: `Sesi ${schedule.tujuan_kemoterapi || ''} Anda akan dimulai dalam ${schedule.remember_before_minutes || 0} menit. Siapkan diri Anda dengan baik.`,
        receiver: schedule.id_user,
        sender: 'system',
        tipe,
        attribute: {
          link: '/notification'
        }
      };

      await NotificationSent.create({
        ...attribute,
        id_chemoSchedule: schedule.id_chemoSchedule || null
      });

      await ChemoSchedule.update({ is_sent: true }, {
        where: { id_chemoSchedule: schedule.id_chemoSchedule }
      });

      stopScheduledJob(schedule, tipe);
      notificationController.pushNotification(attribute);

    } else if (tipe === 'drug_consume_time') {
      attribute = {
        fcm_token: user.fcm_token,
        title: '⏰ Pengingat Jadwal Minum Obat',
        body: `Saatnya minum obat ${schedule.name || ''}! Jangan lupa untuk menjaga kesehatan dengan mengikuti jadwal obat Anda.`,
        receiver: schedule.id_user,
        sender: 'system',
        tipe,
        attribute: {
          link: '/notification'
        }
      };

      await NotificationSent.create({
        ...attribute,
        id_drug_consume_time: schedule.id_drug_consume_time || null
      });

      await DrugConsumeTime.update({ is_sent: true }, {
        where: { id_drug_consume_time: schedule.id_drug_consume_time }
      });

      stopScheduledJob(schedule, tipe);
      notificationController.pushNotification(attribute);
    }

    console.log(`Notification sent for ${tipe} to user id ${schedule.id_user}`);

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

// unused 
const getHoursAndMinutes = (timesArray) => {
    return timesArray.map(time => {
        const [hour, minute] = time.split(":");
        return {
            hour: parseInt(hour),
            minute: parseInt(minute)
        }; // Convert to integer for numerical comparison
    });
};

// Function to convert cron time to WIB
const convertToWIB = (cronExpression) => {
    // Split the cron expression into its components
    const cronParts = cronExpression.split(' ');

    // Check if it includes seconds and set the variables accordingly
    let second, minute, hour, day, month, dayOfWeek;

    if (cronParts.length === 6) {
        // Includes seconds
        [second, minute, hour, day, month, dayOfWeek] = cronParts;
    } else if (cronParts.length === 5) {
        // Does not include seconds
        [minute, hour, day, month, dayOfWeek] = cronParts;
        second = 0; // Default to 0 if not specified
    } else {
        throw new Error('Invalid cron expression');
    }

    // Create a moment object in server time (assuming CDT here as an example)
    const serverTime = moment.tz({ second, minute, hour, day, month: month - 1 }, 'America/Chicago');

    // Convert to WIB (Asia/Jakarta)
    const wibTime = serverTime.clone().tz('Asia/Jakarta');

    // Reformat the cron expression using WIB values
    const newCronExpression = `${wibTime.second()} ${wibTime.minute()} ${wibTime.hour()} ${wibTime.date()} ${wibTime.month() + 1} ${dayOfWeek ? dayOfWeek : '*'}`;

    return newCronExpression;
};

module.exports = {
  initializeCronJobs,
  initializeImmediatelyNotifSchedule,
  initializeImmediatelyNotifScheduleDrug,
  triggerChemoTerapyNotif,
  triggerDrugNotif,
  updateNotificationSchedule,
  stopScheduledJob,
  stopAllJobs,
};
