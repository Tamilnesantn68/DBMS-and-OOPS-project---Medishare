package com.medshare.repo;

import com.medshare.model.Donation;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Date;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class DonationRepo {

    private final JdbcTemplate jdbc;

    public DonationRepo(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Row mapper for queries that join users to include the donating clinic's name. */
    private static final RowMapper<Donation> MAPPER = (rs, i) -> new Donation(
            rs.getLong("d.id"),
            rs.getLong("d.clinic_id"),
            rs.getString("u.clinic_name"),
            rs.getString("d.medicine_name"),
            rs.getString("d.batch_no"),
            rs.getString("d.category"),
            rs.getInt("d.quantity"),
            rs.getDate("d.expiry_date") == null ? null : rs.getDate("d.expiry_date").toLocalDate(),
            rs.getString("d.notes"),
            rs.getString("d.status"),
            rs.getTimestamp("d.created_at") == null ? null : rs.getTimestamp("d.created_at").toLocalDateTime(),
            rs.getTimestamp("d.reviewed_at") == null ? null : rs.getTimestamp("d.reviewed_at").toLocalDateTime()
    );

    private static final String SELECT_WITH_CLINIC =
            "SELECT d.*, u.clinic_name FROM donations d JOIN users u ON u.id = d.clinic_id ";

    public long insert(long clinicId, String medicineName, String batchNo, String category,
                       int quantity, java.time.LocalDate expiryDate, String notes) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO donations (clinic_id, medicine_name, batch_no, category, quantity, expiry_date, notes, status) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, clinicId);
            ps.setString(2, medicineName);
            ps.setString(3, batchNo);
            ps.setString(4, category);
            ps.setInt(5, quantity);
            ps.setDate(6, Date.valueOf(expiryDate));
            ps.setString(7, notes);
            return ps;
        }, keys);
        return keys.getKey() == null ? -1 : keys.getKey().longValue();
    }

    public Optional<Donation> findById(long id) {
        List<Donation> rows = jdbc.query(SELECT_WITH_CLINIC + "WHERE d.id = ?", MAPPER, id);
        return rows.stream().findFirst();
    }

    public List<Donation> findByClinic(long clinicId) {
        return jdbc.query(SELECT_WITH_CLINIC + "WHERE d.clinic_id = ? ORDER BY d.created_at DESC", MAPPER, clinicId);
    }

    public List<Donation> findAll(String status) {
        if (status == null || status.isBlank()) {
            return jdbc.query(SELECT_WITH_CLINIC + "ORDER BY d.created_at DESC", MAPPER);
        }
        return jdbc.query(SELECT_WITH_CLINIC + "WHERE d.status = ? ORDER BY d.created_at DESC", MAPPER, status);
    }

    /** Approved batches still available in stock, nearest expiry first (so near-expiry medicine moves first). */
    public List<Donation> findAvailableStock(String medicineName) {
        if (medicineName == null || medicineName.isBlank()) {
            return jdbc.query(SELECT_WITH_CLINIC + "WHERE d.status = 'APPROVED' ORDER BY d.expiry_date ASC", MAPPER);
        }
        return jdbc.query(SELECT_WITH_CLINIC
                        + "WHERE d.status = 'APPROVED' AND LOWER(d.medicine_name) = LOWER(?) ORDER BY d.expiry_date ASC",
                MAPPER, medicineName);
    }

    public void updateStatus(long id, String status) {
        jdbc.update("UPDATE donations SET status = ?, reviewed_at = NOW() WHERE id = ?", status, id);
    }
}
