package cuff.cuff_springboot.service;

import cuff.cuff_springboot.entity.Notification;
import cuff.cuff_springboot.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
    
}

    

