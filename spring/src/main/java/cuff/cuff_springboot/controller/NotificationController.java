package cuff.cuff_springboot.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cuff.cuff_springboot.entity.Notification;
import cuff.cuff_springboot.service.NotificationService;

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
    @PostMapping("/send")
    public Notification sendNotification(
        @RequestParam Integer userId,
        @RequestParam String message) {

    return notificationService.sendNotification(userId, message);
}
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable Integer userId) {
    return notificationService.getNotificationsByUser(userId);
}

}



