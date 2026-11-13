package com.medshare.repo;

import com.medshare.model.MedicineRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class RequestRepo {

    private final JdbcTemplate jdbc;

    public RequestRepo(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<MedicineRequest> MAPPER = (rs, i) -> new MedicineRequest(
            rs.getLong("r.id"),
            rs.getLong("r.clinic_id"),
            rs.getString("u.clinic_name"),
            rs.getString("r.medicine_name"),
            rs.getString("r.category"),
            rs.getInt("r.quantity"),
            rs.getString("r.urgency"),
            rs.getString("r.reason"),
            rs.getString("r.status"),
            rs.getTimestamp("r.created_at") == null ? null : rs.getTimestamp("r.created_at").toLocalDateTime(),
            rs.getTimestamp("r.resolved_at") == null ? null : rs.getTimestamp("r.resolved_at").toLocalDateTime(),
            rs.getObject("r.fulfilled_donation_id") == null ? null : rs.getLong("r.fulfilled_donation_id")
    );

    private static final String SELECT_WITH_CLINIC =
            "SELECT r.*, u.clinic_name FROM requests r JOIN users u ON u.id = r.clinic_id ";

    public long insert(long clinicId, String medicineName, String category, int quantity, String urgency, String reason) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO requests (clinic_id, medicine_name, category, quantity, urgency, reason, status) "
                            + "VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, clinicId);
            ps.setString(2, medicineName);
            ps.setString(3, category);
            ps.setInt(4, quantity);
            ps.setString(5, urgency);
            ps.setString(6, reason);
            return ps;
        }, keys);
        return keys.getKey() == null ? -1 : keys.getKey().longValue();
    }

    public Optional<MedicineRequest> findById(long id) {
        List<MedicineRequest> rows = jdbc.query(SELECT_WITH_CLINIC + "WHERE r.id = ?", MAPPER, id);
        return rows.stream().findFirst();
    }

    public List<MedicineRequest> findByClinic(long clinicId) {
        return jdbc.query(SELECT_WITH_CLINIC + "WHERE r.clinic_id = ? ORDER BY r.created_at DESC", MAPPER, clinicId);
    }

    public List<MedicineRequest> findAll(String status) {
        if (status == null || status.isBlank()) {
            return jdbc.query(SELECT_WITH_CLINIC + "ORDER BY r.created_at DESC", MAPPER);
        }
        return jdbc.query(SELECT_WITH_CLINIC + "WHERE r.status = ? ORDER BY r.created_at DESC", MAPPER, status);
    }

    public void updateStatus(long id, String status, Long fulfilledDonationId) {
        jdbc.update("UPDATE requests SET status = ?, resolved_at = NOW(), fulfilled_donation_id = ? WHERE id = ?",
                status, fulfilledDonationId, id);
    }
}
