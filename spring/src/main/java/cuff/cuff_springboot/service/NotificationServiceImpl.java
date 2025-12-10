package cuff.cuff_springboot.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cuff.cuff_springboot.entity.Notification;
import cuff.cuff_springboot.repository.NotificationRepository;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Integer id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public Notification getNotificationById(Integer id) {
        return notificationRepository.findById(id).orElse(null);
    }

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }
    @Override
    public Notification sendNotification (Integer userId, String message){
       Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setPostId(0);
        notif.setMessageContent(message);
        notif.setStatus("unread");
        notif.setSentAt(LocalDateTime.now());
        return notificationRepository.save(notif);
    }
    @Override
    public List<Notification> getNotificationsByUser(Integer userId) {
        return notificationRepository.findByUserId(userId);
}


}

    

