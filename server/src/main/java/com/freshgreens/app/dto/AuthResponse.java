package com.freshgreens.app.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {

    private Long id;
    private String displayName;
    private String email;
    private String photoUrl;
    private String role;
    private boolean newUser;
    private String phone;
    private String city;
    private String pincode;
    private boolean emailVerified;
    private boolean phoneVerified;
}
