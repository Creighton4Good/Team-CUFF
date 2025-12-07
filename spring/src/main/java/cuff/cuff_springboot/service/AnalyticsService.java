package cuff.cuff_springboot.service;

import cuff.cuff_springboot.entity.Analytics;
import java.util.List;

public interface AnalyticsService {
    Analytics createAnalytics(Analytics analytics);
    void deleteAnalytics(Integer id);
    Analytics getAnalyticsById(Integer id);
    List<Analytics> getAllAnalytics();
}
