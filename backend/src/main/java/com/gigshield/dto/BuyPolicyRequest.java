package com.gigshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class BuyPolicyRequest {
    @NotBlank private String pincode;
    @NotEmpty private List<String> coverageTypes;
}
