package com.gigshield.controller;

import com.gigshield.dto.BuyPolicyRequest;
import com.gigshield.dto.PremiumQuoteRequest;
import com.gigshield.dto.PremiumQuoteResponse;
import com.gigshield.model.Policy;
import com.gigshield.service.PolicyService;
import com.gigshield.service.PremiumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/policy")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final PremiumService premiumService;

    /**
     * POST /api/policy/quote — get ML-based premium quote (public)
     */
    @PostMapping("/quote")
    public ResponseEntity<PremiumQuoteResponse> getQuote(@Valid @RequestBody PremiumQuoteRequest request) {
        PremiumQuoteResponse response = premiumService.calculatePremium(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/policy/buy — buy a weekly policy (protected)
     */
    @PostMapping("/buy")
    public ResponseEntity<Policy> buyPolicy(@AuthenticationPrincipal UUID userId,
                                            @Valid @RequestBody BuyPolicyRequest request) {
        Policy policy = policyService.buyPolicy(userId, request);
        return ResponseEntity.ok(policy);
    }

    /**
     * GET /api/policy/my — get current worker's policies (protected)
     */
    @GetMapping("/my")
    public ResponseEntity<List<Policy>> getMyPolicies(@AuthenticationPrincipal UUID userId) {
        List<Policy> policies = policyService.getWorkerPolicies(userId);
        return ResponseEntity.ok(policies);
    }

    /**
     * PUT /api/policy/{id}/cancel — cancel a policy (protected)
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Policy> cancelPolicy(@AuthenticationPrincipal UUID userId,
                                               @PathVariable UUID id) {
        Policy policy = policyService.cancelPolicy(id, userId);
        return ResponseEntity.ok(policy);
    }
}
