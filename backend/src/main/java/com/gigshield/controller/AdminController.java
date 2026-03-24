package com.gigshield.controller;

import com.gigshield.model.DisruptionEvent;
import com.gigshield.model.Notification;
import com.gigshield.model.Worker;
import com.gigshield.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final WorkerRepository workerRepository;
    private final PolicyRepository policyRepository;
    private final ClaimsRepository claimsRepository;
    private final DisruptionEventRepository disruptionEventRepository;
    private final NotificationRepository notificationRepository;

    /**
     * GET /api/admin/stats — dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long activePolicies = policyRepository.countByStatus("Active");
        long totalClaims = claimsRepository.count();
        long pendingClaims = claimsRepository.countByStatus("Pending");
        BigDecimal totalPayout = claimsRepository.sumPaidPayouts();

        return ResponseEntity.ok(Map.of(
                "activePolicies", activePolicies,
                "totalClaims", totalClaims,
                "pendingClaims", pendingClaims,
                "totalPayout", totalPayout != null ? totalPayout : BigDecimal.ZERO,
                "totalWorkers", workerRepository.count()
        ));
    }

    /**
     * GET /api/admin/workers — all workers list
     */
    @GetMapping("/workers")
    public ResponseEntity<List<Worker>> getAllWorkers() {
        return ResponseEntity.ok(workerRepository.findAll());
    }

    /**
     * GET /api/admin/disruptions — all disruption events
     */
    @GetMapping("/disruptions")
    public ResponseEntity<List<DisruptionEvent>> getAllDisruptions() {
        return ResponseEntity.ok(disruptionEventRepository.findAllByOrderByDetectedAtDesc());
    }

    /**
     * GET /api/notifications/my — worker's notifications (protected)
     */
    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications(@AuthenticationPrincipal UUID userId) {
        List<Notification> notifications = notificationRepository.findByWorkerIdOrderByCreatedAtDesc(userId);
        long unreadCount = notificationRepository.countByWorkerIdAndIsRead(userId, false);

        return ResponseEntity.ok(Map.of(
                "notifications", notifications,
                "unreadCount", unreadCount
        ));
    }

    /**
     * PUT /api/notifications/{id}/read — mark notification as read
     */
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable UUID id) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                    return ResponseEntity.ok(notification);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
