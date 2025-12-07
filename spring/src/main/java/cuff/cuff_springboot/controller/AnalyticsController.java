package cuff.cuff_springboot.controller;

import cuff.cuff_springboot.entity.Analytics;
import cuff.cuff_springboot.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @PostMapping
    public Analytics createAnalytics(@RequestBody Analytics analytics) { // to create an analytics entry
        return analyticsService.createAnalytics(analytics);
    }

    @DeleteMapping("/{id}")
    public void deleteAnalytics(@PathVariable Integer id) { // to delete analytics by ID
        analyticsService.deleteAnalytics(id);
    }

    @GetMapping
    public List<Analytics> getAllAnalytics() { // to get all analytics entries
        return analyticsService.getAllAnalytics();
    }

    @GetMapping("/{id}")
    public Analytics getAnalyticsById(@PathVariable Integer id) { // get analytics entry by ID
        return analyticsService.getAnalyticsById(id);
    }
}
