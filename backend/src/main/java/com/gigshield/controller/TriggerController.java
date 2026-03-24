package com.gigshield.controller;

import com.gigshield.model.DisruptionEvent;
import com.gigshield.repository.DisruptionEventRepository;
import com.gigshield.service.TriggerEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/triggers")
@RequiredArgsConstructor
public class TriggerController {

    private final DisruptionEventRepository disruptionEventRepository;
    private final TriggerEngineService triggerEngineService;

    /**
     * GET /api/triggers/events — latest disruption events (public)
     */
    @GetMapping("/events")
    public ResponseEntity<List<DisruptionEvent>> getLatestEvents() {
        List<DisruptionEvent> events = disruptionEventRepository.findTop20ByOrderByDetectedAtDesc();
        return ResponseEntity.ok(events);
    }

    /**
     * POST /api/triggers/manual — admin fires curfew or flood trigger
     */
    @PostMapping("/manual")
    public ResponseEntity<DisruptionEvent> manualTrigger(@RequestBody Map<String, String> body) {
        String pincode = body.get("pincode");
        String triggerType = body.get("triggerType");
        String triggerValue = body.getOrDefault("triggerValue",
                triggerType.toUpperCase() + " declared in zone " + pincode);

        DisruptionEvent event = triggerEngineService.manualTrigger(pincode, triggerType, triggerValue);
        return ResponseEntity.ok(event);
    }
}
