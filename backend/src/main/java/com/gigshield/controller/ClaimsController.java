package com.gigshield.controller;

import com.gigshield.model.Claim;
import com.gigshield.service.ClaimsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimsController {

    private final ClaimsService claimsService;

    /**
     * GET /api/claims/my — worker's claim history (protected)
     */
    @GetMapping("/my")
    public ResponseEntity<List<Claim>> getMyClaims(@AuthenticationPrincipal UUID userId) {
        List<Claim> claims = claimsService.getWorkerClaims(userId);
        return ResponseEntity.ok(claims);
    }

    /**
     * POST /api/claims/manual — file a manual claim (protected)
     */
    @PostMapping("/manual")
    public ResponseEntity<Claim> fileManualClaim(@AuthenticationPrincipal UUID userId,
                                                 @RequestBody Map<String, String> body) {
        UUID policyId = UUID.fromString(body.get("policyId"));
        String triggerType = body.get("triggerType");
        String triggerValue = body.get("triggerValue");

        Claim claim = claimsService.fileManualClaim(userId, policyId, triggerType, triggerValue);
        return ResponseEntity.ok(claim);
    }

    /**
     * GET /api/claims/all — admin only: all claims
     */
    @GetMapping("/all")
    public ResponseEntity<List<Claim>> getAllClaims() {
        // Note: admin authorization is handled by is_admin check in a real deployment
        List<Claim> claims = claimsService.getAllClaims();
        return ResponseEntity.ok(claims);
    }

    /**
     * PUT /api/claims/{id}/status — admin updates claim status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Claim> updateClaimStatus(@PathVariable UUID id,
                                                    @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        Claim claim = claimsService.updateClaimStatus(id, newStatus);
        return ResponseEntity.ok(claim);
    }
}
