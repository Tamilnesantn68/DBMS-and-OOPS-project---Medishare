package com.medshare.web;

import com.medshare.model.AppUser;
import com.medshare.model.Donation;
import com.medshare.model.MedicineRequest;
import com.medshare.repo.DonationRepo;
import com.medshare.repo.RequestRepo;
import com.medshare.repo.UserRepo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Admin-only endpoints: approve donations, fulfill requests, manage clinics and stock. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepo users;
    private final DonationRepo donations;
    private final RequestRepo requests;

    public AdminController(UserRepo users, DonationRepo donations, RequestRepo requests) {
        this.users = users;
        this.donations = donations;
        this.requests = requests;
    }

    // ---------- overview ----------

    /** Dashboard counters + the latest activity so the admin sees clinic actions immediately. */
    @GetMapping("/overview")
    public Map<String, Object> overview() {
        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("pendingDonations", donations.findAll(Donation.PENDING).size());
        overview.put("pendingRequests", requests.findAll(MedicineRequest.PENDING).size());
        overview.put("availableStock", donations.findAll(Donation.APPROVED).size());
        overview.put("totalClinics", users.findAllClinics().size());
        overview.put("pendingClinics", users.findAllClinics().stream().filter(u -> "PENDING".equals(u.status())).count());
        overview.put("fulfilledRequests", requests.findAll(MedicineRequest.FULFILLED).size());
        overview.put("recent", recentActivity());
        return overview;
    }

    private List<Map<String, Object>> recentActivity() {
        List<Map<String, Object>> items = new java.util.ArrayList<>();
        donations.findAll(null).stream().limit(10).forEach(d -> items.add(new LinkedHashMap<>(Map.of(
                "kind", "DONATION",
                "id", d.id(),
                "clinicName", d.clinicName() == null ? "" : d.clinicName(),
                "medicineName", d.medicineName(),
                "quantity", d.quantity(),
                "status", d.status(),
                "createdAt", d.createdAt()))));
        requests.findAll(null).stream().limit(10).forEach(r -> items.add(new LinkedHashMap<>(Map.of(
                "kind", "REQUEST",
                "id", r.id(),
                "clinicName", r.clinicName() == null ? "" : r.clinicName(),
                "medicineName", r.medicineName(),
                "quantity", r.quantity(),
                "status", r.status(),
                "createdAt", r.createdAt()))));
        items.sort(Comparator.comparing(m -> ((LocalDateTime) m.get("createdAt")), Comparator.reverseOrder()));
        return items.stream().limit(8).toList();
    }

    // ---------- donations ----------

    @GetMapping("/donations")
    public List<Donation> listDonations(@RequestParam(required = false) String status) {
        return donations.findAll(status);
    }

    @PostMapping("/donations/{id}/approve")
    public Map<String, String> approveDonation(@PathVariable long id) {
        Donation donation = donations.findById(id)
                .orElseThrow(() -> ApiException.notFound("Donation #" + id + " not found."));
        if (!Donation.PENDING.equals(donation.status())) {
            throw ApiException.conflict("Donation #" + id + " was already reviewed (status: " + donation.status() + ").");
        }
        donations.updateStatus(id, Donation.APPROVED);
        return Map.of("message", "Donation '" + donation.medicineName() + "' approved and added to stock.");
    }

    @PostMapping("/donations/{id}/reject")
    public Map<String, String> rejectDonation(@PathVariable long id) {
        Donation donation = donations.findById(id)
                .orElseThrow(() -> ApiException.notFound("Donation #" + id + " not found."));
        if (!Donation.PENDING.equals(donation.status())) {
            throw ApiException.conflict("Donation #" + id + " was already reviewed (status: " + donation.status() + ").");
        }
        donations.updateStatus(id, Donation.REJECTED);
        return Map.of("message", "Donation '" + donation.medicineName() + "' rejected.");
    }

    // ---------- requests ----------

    @GetMapping("/requests")
    public List<MedicineRequest> listRequests(@RequestParam(required = false) String status) {
        return requests.findAll(status);
    }

    /**
     * Fulfill a pending request from approved stock. The admin may pass a specific
     * donation batch id; without one, the batch nearest expiry of the same medicine is used,
     * so near-expiry stock is redistributed first.
     */
    @PostMapping("/requests/{id}/fulfill")
    public Map<String, String> fulfillRequest(@PathVariable long id,
                                              @RequestBody(required = false) Map<String, Long> body) {
        MedicineRequest req = requests.findById(id)
                .orElseThrow(() -> ApiException.notFound("Request #" + id + " not found."));
        if (!MedicineRequest.PENDING.equals(req.status())) {
            throw ApiException.conflict("Request #" + id + " was already handled (status: " + req.status() + ").");
        }

        List<Donation> stock = donations.findAvailableStock(req.medicineName());
        if (stock.isEmpty()) {
            throw ApiException.conflict(
                    "No approved stock of '" + req.medicineName() + "' is available right now. Approve a donation first.");
        }

        Long donationId = body == null ? null : body.get("donationId");
        Donation batch = (donationId == null ? stock.get(0)
                : stock.stream().filter(d -> d.id().equals(donationId)).findFirst()
                .orElseThrow(() -> ApiException.badRequest("The selected stock batch is not available stock.")));

        donations.updateStatus(batch.id(), Donation.DISPENSED);
        requests.updateStatus(id, MedicineRequest.FULFILLED, batch.id());
        return Map.of("message", "Request #" + id + " fulfilled: '" + req.medicineName()
                + "' (batch " + (batch.batchNo() == null || batch.batchNo().isBlank() ? "-" : batch.batchNo())
                + ") from " + batch.clinicName() + " given to " + req.clinicName() + ".");
    }

    @PostMapping("/requests/{id}/reject")
    public Map<String, String> rejectRequest(@PathVariable long id) {
        MedicineRequest req = requests.findById(id)
                .orElseThrow(() -> ApiException.notFound("Request #" + id + " not found."));
        if (!MedicineRequest.PENDING.equals(req.status())) {
            throw ApiException.conflict("Request #" + id + " was already handled (status: " + req.status() + ").");
        }
        requests.updateStatus(id, MedicineRequest.REJECTED, null);
        return Map.of("message", "Request '" + req.medicineName() + "' rejected.");
    }

    // ---------- stock ----------

    /** Approved batches currently waiting to be given out, nearest expiry first. */
    @GetMapping("/stock")
    public List<Donation> stock(@RequestParam(required = false) String medicineName) {
        return donations.findAvailableStock(medicineName);
    }

    // ---------- clinics ----------

    @GetMapping("/clinics")
    public List<AppUser> listClinics() {
        return users.findAllClinics().stream().map(AppUser::withoutSecrets).toList();
    }

    @PostMapping("/clinics/{id}/approve")
    public Map<String, String> approveClinic(@PathVariable long id) {
        return setClinicStatus(id, "ACTIVE", "approved — the clinic can now sign in");
    }

    @PostMapping("/clinics/{id}/reject")
    public Map<String, String> rejectClinic(@PathVariable long id) {
        return setClinicStatus(id, "REJECTED", "rejected — the clinic cannot sign in");
    }

    private Map<String, String> setClinicStatus(long id, String status, String doneMessage) {
        AppUser clinic = users.findById(id)
                .orElseThrow(() -> ApiException.notFound("Clinic #" + id + " not found."));
        if (!AppUser.ROLE_CLINIC.equals(clinic.role())) {
            throw ApiException.badRequest("User #" + id + " is not a clinic account.");
        }
        users.updateStatus(id, status);
        return Map.of("message", "Clinic '" + clinic.clinicName() + "' " + doneMessage + ".");
    }
}
