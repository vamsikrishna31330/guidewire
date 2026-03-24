package com.gigshield.repository;

import com.gigshield.model.DisruptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DisruptionEventRepository extends JpaRepository<DisruptionEvent, UUID> {

    List<DisruptionEvent> findAllByOrderByDetectedAtDesc();

    boolean existsByPincodeAndTriggerTypeAndDetectedAtAfter(
            String pincode, String triggerType, OffsetDateTime after);

    List<DisruptionEvent> findTop20ByOrderByDetectedAtDesc();
}
