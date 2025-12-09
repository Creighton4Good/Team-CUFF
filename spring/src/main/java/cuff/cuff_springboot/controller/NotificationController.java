package cuff.cuff_springboot.controller;

import cuff.cuff_springboot.entity.Notification;
import cuff.cuff_springboot.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) { // to create a notification
        return notificationService.createNotification(notification);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Integer id) { // to delete a notification by ID
        notificationService.deleteNotification(id);
    }

    @GetMapping
    public List<Notification> getAllNotifications() { // to get all notifications
        return notificationService.getAllNotifications();
    }

    @GetMapping("/{id}")
    public Notification getNotificationById(@PathVariable Integer id) { // get notification by ID
        return notificationService.getNotificationById(id);
    }

}
