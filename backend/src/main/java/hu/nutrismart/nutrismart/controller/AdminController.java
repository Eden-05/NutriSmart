package hu.nutrismart.nutrismart.controller;

import hu.nutrismart.nutrismart.dto.AdminUserUpdateRequest;
import hu.nutrismart.nutrismart.dto.UserResponse;
import hu.nutrismart.nutrismart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return userService.getAllUsers();
    }

    @PatchMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                                   @Valid @RequestBody AdminUserUpdateRequest request,
                                   Authentication authentication) {
        return userService.adminUpdateUser(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id, Authentication authentication) {
        userService.adminDeleteUser(id, authentication.getName());
    }
}
