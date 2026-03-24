package com.gigshield.service;

import com.gigshield.model.Claim;
import com.gigshield.model.Notification;
import com.gigshield.model.Policy;
import com.gigshield.model.Worker;
import com.gigshield.repository.ClaimsRepository;
import com.gigshield.repository.NotificationRepository;
import com.gigshield.repository.PolicyRepository;
import com.gigshield.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClaimsService {

    private static final Logger log = LoggerFactory.getLogger(ClaimsService.class);
    private final ClaimsRepository claimsRepository;
    private final PolicyRepository policyRepository;
    private final WorkerRepository workerRepository;
    private final NotificationRepository notificationRepository;

    public List<Claim> getWorkerClaims(UUID workerId) {
        return claimsRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
    }

    public List<Claim> getAllClaims() {
        return claimsRepository.findAll();
    }

    /**
     * Auto-create claims for all workers with active policies in the given pincode
     * when a disruption trigger fires. Called by TriggerEngineService.
     */
    @Transactional
    public int autoCreateClaims(String pincode, String triggerType, String triggerValue) {
        // TODO Phase 3: Run FCS (Fraud Confidence Score) check here before approving auto-claim

        List<Policy> activePolicies = policyRepository.findByPincodeAndStatus(pincode, "Active");
        List<Claim> createdClaims = new ArrayList<>();

        for (Policy policy : activePolicies) {
            // Check if coverage includes this trigger type
            boolean covered = false;
            if (policy.getCoverageTypes() != null) {
                for (String type : policy.getCoverageTypes()) {
                    if (type.equalsIgnoreCase(triggerType)) {
                        covered = true;
                        break;
                    }
                }
            }

            if (!covered) {
                log.debug("Policy {} does not cover trigger type {}", policy.getId(), triggerType);
                continue;
            }

            // Calculate payout (based on weekly premium * multiplier)
            BigDecimal payout = calculatePayout(policy, triggerType);

            Claim claim = Claim.builder()
                    .workerId(policy.getWorkerId())
                    .policyId(policy.getId())
                    .triggerType(triggerType)
                    .triggerValue(triggerValue)
                    .pincode(pincode)
                    .status("Verified")
                    .payoutAmount(payout)
                    .isAutomatic(true)
                    .detectedAt(OffsetDateTime.now())
                    .build();

            createdClaims.add(claimsRepository.save(claim));

            // Update worker claim count
            workerRepository.findById(policy.getWorkerId()).ifPresent(worker -> {
                worker.setClaimCount(worker.getClaimCount() + 1);
                workerRepository.save(worker);
            });

            // Create notification
            Notification notification = Notification.builder()
                    .workerId(policy.getWorkerId())
                    .message(String.format("🚨 Auto-claim created: %s detected in your zone (%s). Payout: ₹%s",
                            triggerType.toUpperCase(), triggerValue, payout))
                    .type("claim")
                    .build();
            notificationRepository.save(notification);

            log.info("Auto-claim created: worker={}, trigger={}, payout=₹{}", policy.getWorkerId(), triggerType, payout);
        }

        return createdClaims.size();
    }

    /**
     * File a manual claim (worker-initiated).
     */
    @Transactional
    public Claim fileManualClaim(UUID workerId, UUID policyId, String triggerType, String triggerValue) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getWorkerId().equals(workerId)) {
            throw new RuntimeException("Unauthorized: policy does not belong to this worker");
        }

        BigDecimal payout = calculatePayout(policy, triggerType);

        Claim claim = Claim.builder()
                .workerId(workerId)
                .policyId(policyId)
                .triggerType(triggerType)
                .triggerValue(triggerValue)
                .pincode(policy.getPincode())
                .status("Pending")
                .payoutAmount(payout)
                .isAutomatic(false)
                .detectedAt(OffsetDateTime.now())
                .build();

        Claim saved = claimsRepository.save(claim);
        log.info("Manual claim filed: id={}, worker={}", saved.getId(), workerId);
        return saved;
    }

    /**
     * Admin updates claim status (Verified → Paid, or Rejected).
     */
    @Transactional
    public Claim updateClaimStatus(UUID claimId, String newStatus) {
        Claim claim = claimsRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(newStatus);
        Claim saved = claimsRepository.save(claim);

        if ("Paid".equals(newStatus)) {
            // TODO Phase 3: Trigger Razorpay/Stripe mock payout here
            Notification notification = Notification.builder()
                    .workerId(claim.getWorkerId())
                    .message(String.format("💰 Claim #%s has been paid! Payout: ₹%s",
                            claim.getId().toString().substring(0, 8), claim.getPayoutAmount()))
                    .type("claim")
                    .build();
            notificationRepository.save(notification);
        }

        log.info("Claim {} status updated to {}", claimId, newStatus);
        return saved;
    }

    private BigDecimal calculatePayout(Policy policy, String triggerType) {
        // Payout = weekly premium * trigger multiplier
        double multiplier = switch (triggerType.toLowerCase()) {
            case "rain" -> 2.5;
            case "heat" -> 2.0;
            case "aqi" -> 1.8;
            case "curfew" -> 3.0;
            case "flood" -> 4.0;
            default -> 2.0;
        };
        return policy.getWeeklyPremium().multiply(BigDecimal.valueOf(multiplier));
    }
}
