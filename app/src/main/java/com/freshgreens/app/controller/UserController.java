package com.freshgreens.app.controller;

import com.freshgreens.app.dto.ApiResponse;
import com.freshgreens.app.dto.UserUpdateRequest;
import com.freshgreens.app.model.User;
import com.freshgreens.app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/me — Get current authenticated user profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(
            @AuthenticationPrincipal User user) {
        Map<String, Object> profile = Map.of(
                "id", user.getId(),
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "photoUrl", user.getPhotoUrl() != null ? user.getPhotoUrl() : "",
                "city", user.getCity() != null ? user.getCity() : "",
                "pincode", user.getPincode() != null ? user.getPincode() : "",
                "role", user.getRole().name(),
                "emailVerified", user.isEmailVerified(),
                "phoneVerified", user.isPhoneVerified()
        );
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * PUT /api/users/me — Update user profile
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<String>> updateProfile(
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal User user) {
        userService.updateUser(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", null));
    }

    /**
     * POST /api/users/verify-email — Mark email as verified
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(
            @AuthenticationPrincipal User user) {
        userService.verifyEmail(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Email verified", null));
    }

    /**
     * POST /api/users/verify-phone — Verify phone number
     */
    @PostMapping("/verify-phone")
    public ResponseEntity<ApiResponse<String>> verifyPhone(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Phone number is required"));
        }
        userService.verifyPhone(user.getId(), phone);
        return ResponseEntity.ok(ApiResponse.success("Phone verified", null));
    }
}
