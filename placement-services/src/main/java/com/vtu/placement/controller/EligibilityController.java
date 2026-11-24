package com.vtu.placement.controller;

import com.vtu.placement.dto.EligibilityDtos.BulkEligibilityRequest;
import com.vtu.placement.dto.EligibilityDtos.EligibilityRequest;
import com.vtu.placement.dto.EligibilityDtos.EligibilityResponse;
import com.vtu.placement.service.EligibilityService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/eligibility")
public class EligibilityController {

    private final EligibilityService eligibilityService;

    public EligibilityController(EligibilityService eligibilityService) {
        this.eligibilityService = eligibilityService;
    }

    /** One student vs one drive (student "Check eligibility" button). */
    @PostMapping("/check")
    public EligibilityResponse check(@Valid @RequestBody EligibilityRequest request) {
        return eligibilityService.check(request.student(), request.criteria());
    }

    /** Many students vs one drive (admin "eligible candidates" list). */
    @PostMapping("/check-bulk")
    public List<EligibilityResponse> checkBulk(@Valid @RequestBody BulkEligibilityRequest request) {
        return eligibilityService.checkBulk(request);
    }
}
