package com.gigshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RegisterRequest {
    @NotBlank private String name;
    @NotBlank private String phone;
    @NotBlank private String city;
    @NotBlank private String pincode;
    @NotBlank private String platform;
    @NotNull private BigDecimal weeklyEarnings;
}
