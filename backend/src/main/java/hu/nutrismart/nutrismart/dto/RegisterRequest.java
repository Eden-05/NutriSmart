package hu.nutrismart.nutrismart.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email @Pattern(regexp = "^[^\\d].*$", message = "Az email cím nem kezdődhet számmal") String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(min = 8, max = 72) String confirmPassword,
        @NotBlank @Size(max = 35) String fullName
) {
    @AssertTrue(message = "A két jelszó nem egyezik")
    public boolean isPasswordsMatch() {
        return password != null && password.equals(confirmPassword);
    }
}
