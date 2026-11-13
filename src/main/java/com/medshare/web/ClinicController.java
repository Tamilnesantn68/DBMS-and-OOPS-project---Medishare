package com.medshare.web;

import com.medshare.model.Donation;
import com.medshare.model.MedicineRequest;
import com.medshare.repo.DonationRepo;
import com.medshare.repo.RequestRepo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.medshare.config.WebConfig.SESSION_USER_ID;

/** Endpoints for signed-in clinics: donate medicine and request medicine. */
@RestController
@RequestMapping("/api/clinic")
public class ClinicController {

    private static final Set<String> CATEGORIES =
            Set.of("TABLET", "CAPSULE", "SYRUP", "INJECTION", "OINTMENT", "OTHER");
    private static final Set<String> URGENCIES = Set.of("NORMAL", "URGENT");

    private final DonationRepo donations;
    private final RequestRepo requests;

    public ClinicController(DonationRepo donations, RequestRepo requests) {
        this.donations = donations;
        this.requests = requests;
    }

    public record DonateBody(String medicineName, String batchNo, String category,
                             int quantity, String expiryDate, String notes) {}

    public record AskBody(String medicineName, String category, int quantity, String urgency, String reason) {}

    /** All donation batches this clinic has listed, newest first. */
    @GetMapping("/donations")
    public List<Donation> myDonations(HttpServletRequest request) {
        return donations.findByClinic(userId(request));
    }

    /** List a near-expiry batch for redistribution. Admin approval puts it into shared stock. */
    @PostMapping("/donations")
    public Map<String, String> donate(@RequestBody DonateBody body, HttpServletRequest request) {
        String medicineName = required(body.medicineName(), "Medicine name");
        String category = normalizeCategory(body.category());
        if (body.quantity() <= 0) {
            throw ApiException.badRequest("Quantity must be a positive number.");
        }
        if (body.expiryDate() == null || body.expiryDate().isBlank()) {
            throw ApiException.badRequest("Expiry date is required.");
        }
        LocalDate expiry;
        try {
            expiry = LocalDate.parse(body.expiryDate());
        } catch (Exception e) {
            throw ApiException.badRequest("Expiry date must be a valid date (YYYY-MM-DD).");
        }
        if (!expiry.isAfter(LocalDate.now())) {
            throw ApiException.badRequest("This medicine is already expired. Expired medicine cannot be redistributed.");
        }

        donations.insert(userId(request), medicineName, body.batchNo(), category, body.quantity(), expiry, body.notes());
        return Map.of("message", "Thank you! '" + medicineName + "' was submitted and is awaiting admin approval.");
    }

    /** All medicine requests this clinic has raised, newest first. */
    @GetMapping("/requests")
    public List<MedicineRequest> myRequests(HttpServletRequest request) {
        return requests.findByClinic(userId(request));
    }

    /** Ask the platform for a medicine the clinic needs. Admin matches it against approved stock. */
    @PostMapping("/requests")
    public Map<String, String> ask(@RequestBody AskBody body, HttpServletRequest request) {
        String medicineName = required(body.medicineName(), "Medicine name");
        String category = normalizeCategory(body.category());
        if (body.quantity() <= 0) {
            throw ApiException.badRequest("Quantity must be a positive number.");
        }
        String urgency = body.urgency() == null || body.urgency().isBlank() ? "NORMAL" : body.urgency().toUpperCase();
        if (!URGENCIES.contains(urgency)) {
            throw ApiException.badRequest("Urgency must be NORMAL or URGENT.");
        }

        requests.insert(userId(request), medicineName, category, body.quantity(), urgency, body.reason());
        return Map.of("message", "Request for '" + medicineName + "' submitted. The admin will review it shortly.");
    }

    /** Read-only view of the approved shared stock, so clinics can see what is available before requesting. */
    @GetMapping("/stock")
    public List<Donation> availableStock() {
        return donations.findAvailableStock(null);
    }

    private static String normalizeCategory(String raw) {
        String category = raw == null || raw.isBlank() ? "OTHER" : raw.toUpperCase();
        if (!CATEGORIES.contains(category)) {
            throw ApiException.badRequest("Unknown medicine category: " + category);
        }
        return category;
    }

    private static long userId(HttpServletRequest request) {
        return (Long) request.getSession().getAttribute(SESSION_USER_ID);
    }

    private static String required(String value, String field) {
        if (value == null || value.isBlank()) {
            throw ApiException.badRequest(field + " is required.");
        }
        return value.trim();
    }
}
