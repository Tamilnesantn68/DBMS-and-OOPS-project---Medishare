package com.medishare.repository;

import com.medishare.entity.MedicineBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface MedicineBatchRepository extends JpaRepository<MedicineBatch, Long> {
    List<MedicineBatch> findByOrganizationId(Long organizationId);
    List<MedicineBatch> findByOrganizationIdAndStatus(Long organizationId, MedicineBatch.BatchStatus status);
    List<MedicineBatch> findByStatus(MedicineBatch.BatchStatus status);

    @Query("SELECT b FROM MedicineBatch b WHERE b.status = 'APPROVED' AND b.expiryDate <= :deadline")
    List<MedicineBatch> findExpiringBefore(LocalDate deadline);

    @Query("SELECT b FROM MedicineBatch b WHERE b.status = 'APPROVED' AND b.quantity > 0")
    List<MedicineBatch> findAvailableOnMarketplace();
}
