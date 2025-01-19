import { handlingReminder } from '../../handlers/reminders/reminder.js'
import { saveReminderToMongo } from '../../modules/mongodb/reminders/saveReminder.js'
import { textMessage } from '../../models/waSockets/messageModel.js'
import { deleteReminders, listReminder } from '../../modules/mongodb/reminders/checkReminder.js'

export default {
    name: "remind",
    type: "main",
    execute: async (shiroko, msg, args, client) => {
        const taskAndTime = await handlingReminder(args)
        let response = taskAndTime

        if (taskAndTime?.query?.add) {
            const saveToMongo = await saveReminderToMongo(msg.remoteJid, msg.phoneNumber, { task: taskAndTime.task, time: taskAndTime.time }, msg.expired)
            response = saveToMongo
        }
        
        else if (taskAndTime?.query?.delete) {
            const deleteTask = await deleteReminders(msg.remoteJid, taskAndTime?.task)
            response = deleteTask
        }
        
        else if (taskAndTime?.query?.list) {
            const remindersList = await listReminder(msg.remoteJid)
            response = remindersList.length > 0 ? remindersList : "No reminders found."
        }

        const option = textMessage(response, client, msg.expired)
        await shiroko.sendMessage(msg.remoteJid, option.text, option.options)
    }
}