import Notification from "../models/notification.model.js";


/**
 * Get Notifications of the User
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profilePicture",
    });

    await Notification.updateMany({ to: userId }, { isRead: true });
    
    res.status(200).json(notifications);

  } catch (error) {
    res.status(500).json({
    message: "Internal Server Error while Getting the Notification.",
    error: error.message,
    });
  }
};


/**
 * Delete All Notifications of the User
 */
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "All Notifications seleted successfully." });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while Deleting All the Notifications.",
      error: error.message,
    });
  }
};


/**
 * Delete a Notification 
 */
const deleteNotification = async (req, res) => {
  try {
      const { notificationId } = req.params;
      const userId = req.user.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }
    
    if (notification.to.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "You're not allowed to delete this notification." });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "The notification deleted successfully." });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while Deleting the Notification.",
      error: error.message,
    });
  }
};



export { getNotifications, deleteAllNotifications, deleteNotification };