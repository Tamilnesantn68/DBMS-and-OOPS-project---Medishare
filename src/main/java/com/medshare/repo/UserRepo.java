package com.medshare.repo;

import com.medshare.model.AppUser;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepo {

    private final JdbcTemplate jdbc;

    public UserRepo(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<AppUser> MAPPER = (rs, i) -> new AppUser(
            rs.getLong("id"),
            rs.getString("username"),
            rs.getString("password_hash"),
            rs.getString("role"),
            rs.getString("clinic_name"),
            rs.getString("contact_person"),
            rs.getString("phone"),
            rs.getString("address"),
            rs.getString("city"),
            rs.getString("status"),
            rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime()
    );

    public Optional<AppUser> findByUsername(String username) {
        List<AppUser> rows = jdbc.query(
                "SELECT * FROM users WHERE username = ?", MAPPER, username);
        return rows.stream().findFirst();
    }

    public Optional<AppUser> findById(long id) {
        List<AppUser> rows = jdbc.query(
                "SELECT * FROM users WHERE id = ?", MAPPER, id);
        return rows.stream().findFirst();
    }

    public boolean existsByUsername(String username) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE username = ?", Integer.class, username);
        return count != null && count > 0;
    }

    public long insertClinic(String username, String passwordHash, String clinicName,
                             String contactPerson, String phone, String address, String city) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO users (username, password_hash, role, clinic_name, contact_person, phone, address, city, status) "
                            + "VALUES (?, ?, 'CLINIC', ?, ?, ?, ?, ?, 'PENDING')",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, username);
            ps.setString(2, passwordHash);
            ps.setString(3, clinicName);
            ps.setString(4, contactPerson);
            ps.setString(5, phone);
            ps.setString(6, address);
            ps.setString(7, city);
            return ps;
        }, keys);
        return keys.getKey() == null ? -1 : keys.getKey().longValue();
    }

    public void insertAdmin(String username, String passwordHash) {
        jdbc.update("INSERT IGNORE INTO users (username, password_hash, role, clinic_name, contact_person, phone, address, city, status) "
                + "VALUES (?, ?, 'ADMIN', 'System Administration', 'Administrator', '', '', 'HQ', 'ACTIVE')", username, passwordHash);
    }

    public long countAdmins() {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE role = 'ADMIN'", Integer.class);
        return count == null ? 0 : count;
    }

    public List<AppUser> findAllClinics() {
        return jdbc.query("SELECT * FROM users WHERE role = 'CLINIC' ORDER BY created_at DESC", MAPPER);
    }

    public void updateStatus(long id, String status) {
        jdbc.update("UPDATE users SET status = ? WHERE id = ?", status, id);
    }
}
