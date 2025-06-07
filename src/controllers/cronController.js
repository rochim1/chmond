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
    trigger_date: "0 0 23 31 12 *",
    func: ["triggerConsumeDrugNotif"]
  },
  {
    trigger_name: "update_chemo_terapy_notif",
    trigger_date: "0 0 0 * * *",
    func: ["triggerChemoTerapyNotif"]
  }
];

let chemo_jobs = {};
let drug_jobs = {};

const initializeCronJobs = () => {
  try {
    initializeImmediatelyNotifSchedule();
    initializeImmediatelyNotifScheduleDrug();
    initializeMidnightJob();
    console.log('✅ Cron jobs initialized');
  } catch (err) {
    console.error('❌ Error initializing cron jobs:', err);
  }
};

const initializeMidnightJob = () => {
  try {
    const cronInfo = listCronJobs.find(data => data.trigger_name === "update_chemo_terapy_notif");
    if (!cronInfo || !cronInfo.trigger_date) throw new Error("Midnight job trigger config missing");
    
    cron.schedule(cronInfo.trigger_date, () => {
      console.log('🕛 Running midnight job to refresh schedules');
      initializeImmediatelyNotifSchedule();
      initializeImmediatelyNotifScheduleDrug();
    });

    console.log('🕛 Midnight cron job scheduled.');
  } catch (err) {
    console.error('❌ Error initializing midnight cron job:', err);
  }
};

const initializeImmediatelyNotifSchedule = () => {
  try {
    stopAllJobs('chemotherapy');
    triggerChemoTerapyNotif();
    console.log("🔁 Chemotherapy notification jobs reinitialized.");
  } catch (error) {
    console.error('❌ Failed to initialize chemotherapy cron jobs:', error);
  }
};

const initializeImmediatelyNotifScheduleDrug = () => {
  try {
    stopAllJobs('drug_consume_time');
    triggerDrugNotif();
    console.log("🔁 Drug consume time notification jobs reinitialized.");
  } catch (error) {
    console.error('❌ Failed to initialize drug consume time cron jobs:', error);
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

      if (!schedules || schedules.length === 0) break;

      for (const schedule of schedules) {
        if (!schedule.tanggal_kemoterapi || !schedule.waktu_kemoterapi) continue;

        let notifTime = momentz.tz(`${schedule.tanggal_kemoterapi} ${schedule.waktu_kemoterapi}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');
        if (!notifTime.isValid()) continue;

        if (schedule.remember_before_minutes) {
          notifTime = notifTime.subtract(schedule.remember_before_minutes, 'minutes');
        }

        notifTime = notifTime.startOf('minute');

        if (notifTime.isSameOrAfter(momentz().tz('Asia/Jakarta').startOf('minute'))) {
          await scheduleNotification(schedule, 'chemotherapy');
        }
      }
      offset += chunkSize;
    }
  } catch (error) {
    console.error('❌ Error triggering chemotherapy notifications:', error);
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

      if (!schedules || schedules.length === 0) break;

      for (const schedule of schedules) {
        if (!schedule.date || !schedule.time) continue;

        let notifTime = momentz.tz(`${schedule.date} ${schedule.time}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');
        if (!notifTime.isValid()) continue;

        notifTime = notifTime.startOf('minute');

        if (notifTime.isSameOrAfter(momentz().tz('Asia/Jakarta').startOf('minute'))) {
          await scheduleNotification(schedule, 'drug_consume_time');
        }
      }
      offset += chunkSize;
    }
  } catch (error) {
    console.error('❌ Error triggering drug consume notifications:', error);
  }
};

const scheduleNotification = async (schedule, tipe) => {
  try {
    let scheduleDateTime;

    if (tipe === 'chemotherapy') {
      if (!schedule.tanggal_kemoterapi || !schedule.waktu_kemoterapi) return;

      scheduleDateTime = momentz.tz(`${schedule.tanggal_kemoterapi} ${schedule.waktu_kemoterapi}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');
      if (!scheduleDateTime.isValid()) return;

      if (schedule.remember_before_minutes) {
        scheduleDateTime = scheduleDateTime.subtract(schedule.remember_before_minutes, 'minutes');
      }
      console.log('✅ Cron jobs for chemotherapy time initialized');
    } else if (tipe === 'drug_consume_time') {
      if (!schedule.date || !schedule.time) return;

      scheduleDateTime = momentz.tz(`${schedule.date} ${schedule.time}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');
      if (!scheduleDateTime.isValid()) return;
      console.log('✅ Cron jobs for drug consume time initialized');
    } else {
      console.warn('⚠️ Unknown notification type:', tipe);
      return;
    }

    const now = momentz().tz('Asia/Jakarta');
    if (scheduleDateTime.isBefore(now)) {
      console.warn('⏱️ Skipping past schedule for:', tipe);
      return;
    }

    const cronTime = scheduleDateTime.format('s m H D M *');

    const job = cron.schedule(cronTime, async () => {
      console.log(`🔔 Executing ${tipe} notification at ${cronTime}`);
      await sendNotification(schedule, tipe);
    });

    if (tipe === 'chemotherapy') {
      chemo_jobs[schedule.id_chemoSchedule] = job;
    } else if (tipe === 'drug_consume_time') {
      drug_jobs[schedule.id_drug_consume_time] = job;
    }

    return job;

  } catch (error) {
    console.error(`❌ Error scheduling notification for ${tipe}:`, error);
  }
};

const stopScheduledJob = (scheduleIdOrObj, tipe) => {
  try {
    let scheduleId = typeof scheduleIdOrObj === 'object'
      ? tipe === 'chemotherapy' ? scheduleIdOrObj.id_chemoSchedule : scheduleIdOrObj.id_drug_consume_time
      : scheduleIdOrObj;

    if (tipe === 'chemotherapy' && chemo_jobs[scheduleId]) {
      chemo_jobs[scheduleId].stop();
      delete chemo_jobs[scheduleId];
      console.log(`🛑 Stopped chemotherapy job ${scheduleId}`);
    } else if (tipe === 'drug_consume_time' && drug_jobs[scheduleId]) {
      drug_jobs[scheduleId].stop();
      delete drug_jobs[scheduleId];
      console.log(`🛑 Stopped drug consume job ${scheduleId}`);
    }
  } catch (err) {
    console.error('❌ Error stopping scheduled job:', err);
  }
};

const stopAllJobs = (tipe) => {
  try {
    const jobs = tipe === 'chemotherapy' ? chemo_jobs : drug_jobs;

    Object.keys(jobs).forEach(scheduleId => {
      jobs[scheduleId].stop();
      console.log(`🛑 Stopped ${tipe} job ${scheduleId}`);
      delete jobs[scheduleId];
    });

    console.log(`✅ All ${tipe} jobs stopped.`);
  } catch (err) {
    console.error('❌ Error stopping all jobs:', err);
  }
};

const updateNotificationSchedule = async (schedule, tipe = 'chemotherapy') => {
  try {
    stopScheduledJob(schedule, tipe);
    await scheduleNotification(schedule, tipe);
  } catch (error) {
    console.error('❌ Failed to update schedule:', error);
  }
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
      console.warn(`⚠️ No user or FCM token for user ${schedule.id_user}`);
      return;
    }

    let attribute = {
      fcm_token: user.fcm_token,
      title: '',
      body: '',
      receiver: schedule.id_user,
      sender: 'system',
      tipe,
      attribute: { link: '/notification' }
    };

    if (tipe === 'chemotherapy') {
      attribute.title = '⏰ Pengingat Jadwal Kunjungan';
      attribute.body = `Sesi ${schedule.tujuan_kemoterapi || ''} Anda akan dimulai dalam ${schedule.remember_before_minutes || 0} menit.`;

      await NotificationSent.create({ ...attribute, id_chemoSchedule: schedule.id_chemoSchedule });
      await ChemoSchedule.update({ is_sent: true }, { where: { id_chemoSchedule: schedule.id_chemoSchedule } });

    } else if (tipe === 'drug_consume_time') {
      attribute.title = '⏰ Pengingat Jadwal Minum Obat';
      attribute.body = `Saatnya minum obat ${schedule.name || ''}!`;

      await NotificationSent.create({ ...attribute, id_drug_consume_time: schedule.id_drug_consume_time });
      await DrugConsumeTime.update({ is_sent: true }, { where: { id_drug_consume_time: schedule.id_drug_consume_time } });
    }

    stopScheduledJob(schedule, tipe);
    notificationController.pushNotification(attribute);
    console.log(`✅ Notification sent for ${tipe} to user ${schedule.id_user}`);

  } catch (error) {
    console.error('❌ Failed to send notification:', error);
  }
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
  scheduleNotification
};
