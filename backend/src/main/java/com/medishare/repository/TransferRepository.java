package com.medishare.repository;

import com.medishare.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    Optional<Transfer> findByRequestId(Long requestId);
    List<Transfer> findByDonorOrgIdOrRecipientOrgId(Long donorOrgId, Long recipientOrgId);
    List<Transfer> findByStatus(Transfer.TransferStatus status);
}

