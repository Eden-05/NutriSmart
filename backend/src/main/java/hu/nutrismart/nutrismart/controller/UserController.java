package hu.nutrismart.nutrismart.controller;

import hu.nutrismart.nutrismart.dto.UserProfileDto;
import hu.nutrismart.nutrismart.dto.UserResponse;
import hu.nutrismart.nutrismart.entity.User;
import hu.nutrismart.nutrismart.service.AuthService;
import hu.nutrismart.nutrismart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {
        User user = userService.findUserByEmail(authentication.getName());
        return authService.toUserResponse(user);
    }

    @GetMapping("/{id}")
    public UserProfileDto getUser(@PathVariable Long id, Authentication authentication) {
        ensureSelfOrAdmin(id, authentication);
        return userService.getProfileByUserId(id);
    }

    @PutMapping("/{id}")
    public UserProfileDto updateUser(@PathVariable Long id,
                                     @Valid @RequestBody UserProfileDto body,
                                     Authentication authentication) {
        ensureSelfOrAdmin(id, authentication);
        return userService.updateProfile(id, body);
    }

    private void ensureSelfOrAdmin(Long requestedUserId, Authentication authentication) {
        User currentUser = userService.findUserByEmail(authentication.getName());
        boolean admin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (!admin && !currentUser.getId().equals(requestedUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Ehhez a felhasználóhoz nincs hozzáférésed.");
        }
    }
}
