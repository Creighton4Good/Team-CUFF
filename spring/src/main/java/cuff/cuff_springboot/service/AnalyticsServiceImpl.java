package cuff.cuff_springboot.service;

import cuff.cuff_springboot.entity.Analytics;
import cuff.cuff_springboot.repository.AnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Override
    public Analytics createAnalytics(Analytics analytics) {
        return analyticsRepository.save(analytics);
    }

    @Override
    public void deleteAnalytics(Integer id) {
        analyticsRepository.deleteById(id);
    }

    @Override
    public Analytics getAnalyticsById(Integer id) {
        return analyticsRepository.findById(id).orElse(null);
    }

    @Override
    public List<Analytics> getAllAnalytics() {
        return analyticsRepository.findAll();
    }
}
