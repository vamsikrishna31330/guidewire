package com.gigshield.service;

import com.gigshield.dto.BuyPolicyRequest;
import com.gigshield.dto.PremiumQuoteRequest;
import com.gigshield.dto.PremiumQuoteResponse;
import com.gigshield.model.Policy;
import com.gigshield.model.Worker;
import com.gigshield.repository.PolicyRepository;
import com.gigshield.repository.WorkerRepository;
import com.gigshield.util.PincodeZoneMap;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private static final Logger log = LoggerFactory.getLogger(PolicyService.class);
    private final PolicyRepository policyRepository;
    private final WorkerRepository workerRepository;
    private final PremiumService premiumService;

    public List<Policy> getWorkerPolicies(UUID workerId) {
        return policyRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
    }

    @Transactional
    public Policy buyPolicy(UUID workerId, BuyPolicyRequest request) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        // Calculate premium via ML service
        PremiumQuoteRequest quoteReq = new PremiumQuoteRequest();
        quoteReq.setPincode(request.getPincode());
        quoteReq.setCurrentSeason(getCurrentSeason());
        quoteReq.setAqi7dayAvg(100.0); // will be updated with real data
        quoteReq.setRain7dayAvgMm(20.0);
        quoteReq.setWorkerClaimHistory(worker.getClaimCount());
        quoteReq.setWorkerTrustTier(worker.getTrustTier());

        PremiumQuoteResponse quote = premiumService.calculatePremium(quoteReq);

        Policy policy = Policy.builder()
                .workerId(workerId)
                .pincode(request.getPincode())
                .weeklyPremium(BigDecimal.valueOf(quote.getWeeklyPremium()))
                .coverageTypes(request.getCoverageTypes().toArray(new String[0]))
                .riskScore(quote.getRiskScore())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(7))
                .status("Active")
                .build();

        Policy saved = policyRepository.save(policy);
        log.info("Policy created: id={}, worker={}, premium=₹{}", saved.getId(), workerId, quote.getWeeklyPremium());
        return saved;
    }

    @Transactional
    public Policy cancelPolicy(UUID policyId, UUID workerId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getWorkerId().equals(workerId)) {
            throw new RuntimeException("Unauthorized: policy does not belong to worker");
        }

        policy.setStatus("Paused");
        return policyRepository.save(policy);
    }

    private String getCurrentSeason() {
        int month = LocalDate.now().getMonthValue();
        if (month >= 3 && month <= 5) return "summer";
        if (month >= 6 && month <= 9) return "monsoon";
        if (month >= 10 && month <= 11) return "post_monsoon";
        return "winter";
    }
}
