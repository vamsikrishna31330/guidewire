package com.gigshield.controller;

import com.gigshield.dto.RegisterRequest;
import com.gigshield.model.Worker;
import com.gigshield.repository.WorkerRepository;
import com.gigshield.util.PincodeZoneMap;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class AuthController {

    private final WorkerRepository workerRepository;

    /**
     * POST /api/workers/profile
     * Called after Supabase Auth signup to save extra worker profile data.
     */
    @PostMapping("/profile")
    public ResponseEntity<?> createProfile(@AuthenticationPrincipal UUID userId,
                                           @Valid @RequestBody RegisterRequest request) {
        if (workerRepository.existsById(userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Profile already exists"));
        }

        PincodeZoneMap.ZoneInfo zone = PincodeZoneMap.getZone(request.getPincode());

        Worker worker = Worker.builder()
                .id(userId)
                .name(request.getName())
                .phone(request.getPhone())
                .city(request.getCity())
                .pincode(request.getPincode())
                .platform(request.getPlatform())
                .weeklyEarnings(request.getWeeklyEarnings())
                .zoneRiskScore(zone.getRiskScore())
                .trustTier("New")
                .claimCount(0)
                .isAdmin(false)
                .build();

        Worker saved = workerRepository.save(worker);
        return ResponseEntity.ok(saved);
    }

    /**
     * GET /api/workers/me
     * Get current authenticated worker's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UUID userId) {
        return workerRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
