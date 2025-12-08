package cuff.cuff_springboot.service;

import cuff.cuff_springboot.entity.Notification;
import java.util.List;

public interface NotificationService {
    Notification createNotification(Notification notification);
    void deleteNotification(Integer id);
    Notification getNotificationById(Integer id);
    List<Notification> getAllNotifications();
;
}
